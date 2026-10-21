import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { validateRawSubmission } from '../../../src/services/cph/validateRawSubmission.js'
import { logValidationFailure } from '../../../src/helpers/validation-failures.js'

vi.mock('../../../src/helpers/validation-failures.js', () => ({
  logValidationFailure: vi.fn().mockResolvedValue(true)
}))

const server = { id: 'server' }

const buildSubmission = ({ date, meta, main } = {}) => ({
  meta: {
    timestamp: '2026-10-08T08:39:38.073Z',
    referenceNumber: 'WSP-ZSC-JJN',
    ...meta
  },
  data: {
    main: {
      vumpmr: ['Cattle'],
      yDwSNa: { day: 21, month: 10, year: 2026 },
      ...(date && { yDwSNa: date }),
      ...main
    }
  }
})

describe('validateRawSubmission', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-21T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('valid submissions', () => {
    test('returns the submission when the date is today', async () => {
      const submission = buildSubmission()

      await expect(validateRawSubmission(submission, server)).resolves.toEqual(submission)
      expect(logValidationFailure).not.toHaveBeenCalled()
    })

    test('accepts a date seven days from today', async () => {
      const submission = buildSubmission({ date: { day: 28, month: 10, year: 2026 } })

      await expect(validateRawSubmission(submission, server)).resolves.toEqual(submission)
    })

    test('preserves unknown properties', async () => {
      const submission = buildSubmission({ main: { other: 'value' } })
      submission.extra = true

      const result = await validateRawSubmission(submission, server)

      expect(result.extra).toBe(true)
      expect(result.data.main.other).toBe('value')
    })
  })

  describe('invalid submissions', () => {
    test('rejects a date that does not exist', async () => {
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('Invalid submission')
    })

    test('rejects a calendar-invalid date such as 31 February', async () => {
      const submission = buildSubmission({ date: { day: 31, month: 2, year: 2026 } })

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('must be a real date')
    })

    test('rejects a date in the past', async () => {
      const submission = buildSubmission({ date: { day: 20, month: 10, year: 2026 } })

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('must be today or within the next 7 days')
    })

    test('rejects a date more than seven days away', async () => {
      const submission = buildSubmission({ date: { day: 29, month: 10, year: 2026 } })

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('must be today or within the next 7 days')
    })

    test('rejects a date with a missing part', async () => {
      const submission = buildSubmission({ date: { day: 21, month: 10 } })

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('Invalid submission')
    })

    test('rejects a missing meta timestamp', async () => {
      const submission = buildSubmission()
      delete submission.meta.timestamp

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('"meta.timestamp" is required')
    })

    test('rejects a missing meta reference number', async () => {
      const submission = buildSubmission()
      delete submission.meta.referenceNumber

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('"meta.referenceNumber" is required')
    })
  })

  describe('failure logging', () => {
    test('logs each validation failure with the reference number', async () => {
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })
      delete submission.meta.timestamp

      await expect(validateRawSubmission(submission, server)).rejects.toThrow('Invalid submission')

      expect(logValidationFailure).toHaveBeenCalledTimes(2)
      for (const call of logValidationFailure.mock.calls) {
        expect(call[0]).toBe(server)
        expect(call[1]).toBe('WSP-ZSC-JJN')
        expect(typeof call[2]).toBe('string')
      }
    })

    test('logs failures before throwing', async () => {
      const order = []
      logValidationFailure.mockImplementationOnce(async () => {
        order.push('logged')
        return true
      })
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })

      await validateRawSubmission(submission, server).catch(() => order.push('thrown'))

      expect(order).toEqual(['logged', 'thrown'])
    })
  })
})
