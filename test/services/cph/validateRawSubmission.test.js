import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  validateRawSubmissionBody,
  validateRawSubmissionMeta
} from '../../../src/services/cph/validateRawSubmission.js'

const server = {
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}

const buildSubmission = ({ date, meta, main } = {}) => ({
  meta: {
    timestamp: '2026-10-08T08:39:38.073Z',
    referenceNumber: 'WSP-ZSC-JJN',
    formId: 'form-id',
    versionMetadata: { versionNumber: 1 },
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

const failures = errors => errors.map(e => e.failure)

describe('validateRawSubmissionBody', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('valid submissions', () => {
    test('returns no errors for a valid submission', async () => {
      await expect(validateRawSubmissionBody(buildSubmission(), server)).resolves.toEqual([])
      expect(server.logger.error).not.toHaveBeenCalled()
    })

    test('accepts dates in the past and far in the future', async () => {
      const past = buildSubmission({ date: { day: 1, month: 1, year: 2020 } })
      const future = buildSubmission({ date: { day: 1, month: 1, year: 2030 } })

      await expect(validateRawSubmissionBody(past, server)).resolves.toEqual([])
      await expect(validateRawSubmissionBody(future, server)).resolves.toEqual([])
    })

    test('allows unknown properties', async () => {
      const submission = buildSubmission({ main: { other: 'value' } })
      submission.extra = true

      await expect(validateRawSubmissionBody(submission, server)).resolves.toEqual([])
    })
  })

  describe('invalid submissions', () => {
    test('rejects a day out of range', async () => {
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.yDwSNa.day" must be less than or equal to 31'])
    })

    test('rejects a calendar-invalid date such as 31 February', async () => {
      const submission = buildSubmission({ date: { day: 31, month: 2, year: 2026 } })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.yDwSNa" must be a real date'])
    })

    test('rejects a year before 2020', async () => {
      const submission = buildSubmission({ date: { day: 1, month: 1, year: 2019 } })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.yDwSNa.year" must be greater than or equal to 2020'])
    })

    test('rejects a date with a missing part', async () => {
      const submission = buildSubmission({ date: { day: 21, month: 10 } })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.yDwSNa.year" is required'])
    })

    test('rejects a missing date', async () => {
      const submission = buildSubmission()
      delete submission.data.main.yDwSNa

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.yDwSNa" is required'])
    })

    test('rejects an empty vumpmr array', async () => {
      const submission = buildSubmission({ main: { vumpmr: [] } })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(failures(errors)).toEqual(['"data.main.vumpmr" must contain at least 1 items'])
    })

    test('rejects a missing data section', async () => {
      const errors = await validateRawSubmissionBody({ meta: {} }, server)

      expect(failures(errors)).toEqual(['"data" is required'])
    })

    test('collects all errors', async () => {
      const submission = buildSubmission({
        date: { day: 40, month: 13, year: 2026 },
        main: { vumpmr: [] }
      })

      const errors = await validateRawSubmissionBody(submission, server)

      expect(errors).toHaveLength(3)
    })
  })

  describe('failure shape and logging', () => {
    test('returns validation failures with timestamp, failure and context', async () => {
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })

      const [error] = await validateRawSubmissionBody(submission, server)

      expect(error).toEqual({
        timestamp: expect.any(String),
        failure: expect.any(String),
        context: expect.objectContaining({ key: 'day' })
      })
    })

    test('logs the error via the server', async () => {
      const submission = buildSubmission({ date: { day: 40, month: 10, year: 2026 } })

      await validateRawSubmissionBody(submission, server)

      expect(server.logger.error).toHaveBeenCalledWith(expect.any(Error), 'Validation failed for raw submission body')
    })
  })
})

describe('validateRawSubmissionMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns no errors for valid meta', async () => {
    await expect(validateRawSubmissionMeta(buildSubmission(), server)).resolves.toEqual([])
    expect(server.logger.error).not.toHaveBeenCalled()
  })

  test('allows unknown properties', async () => {
    const submission = buildSubmission({ meta: { extra: 'value' } })

    await expect(validateRawSubmissionMeta(submission, server)).resolves.toEqual([])
  })

  test.each([
    ['timestamp'],
    ['referenceNumber'],
    ['formId'],
    ['versionMetadata']
  ])('rejects a missing meta %s', async field => {
    const submission = buildSubmission()
    delete submission.meta[field]

    const errors = await validateRawSubmissionMeta(submission, server)

    expect(failures(errors)).toEqual([`"meta.${field}" is required`])
  })

  test('rejects a missing meta section', async () => {
    const errors = await validateRawSubmissionMeta({}, server)

    expect(failures(errors)).toEqual(['"meta" is required'])
  })

  test('rejects a non-ISO timestamp', async () => {
    const submission = buildSubmission({ meta: { timestamp: 'yesterday' } })

    const errors = await validateRawSubmissionMeta(submission, server)

    expect(failures(errors)).toEqual(['"meta.timestamp" must be in iso format'])
  })

  test('rejects a string version number', async () => {
    const submission = buildSubmission({ meta: { versionMetadata: { versionNumber: '1' } } })

    const errors = await validateRawSubmissionMeta(submission, server)

    expect(failures(errors)).toEqual(['"meta.versionMetadata.versionNumber" must be a number'])
  })

  test('logs the error via the server', async () => {
    const submission = buildSubmission()
    delete submission.meta.timestamp

    await validateRawSubmissionMeta(submission, server)

    expect(server.logger.error).toHaveBeenCalledWith(expect.any(Error), 'Validation failed for raw submission meta')
  })
})
