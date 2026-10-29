import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createValidationFailure } from '../../src/helpers/validation-failure.js'

describe('createValidationFailure', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('creates a validation failure payload with a timestamped message and context', () => {
    const context = {
      field: 'meta.referenceNumber',
      value: 'WSP-ZSC-JJN'
    }

    vi.setSystemTime(new Date('2026-10-21T10:00:00.000Z'))

    expect(createValidationFailure('Invalid submission', context)).toEqual({
      timestamp: '2026-10-21T10:00:00.000Z',
      failure: 'Invalid submission',
      context
    })
  })

  test('allows an undefined context value', () => {
    vi.setSystemTime(new Date('2026-10-21T10:00:00.000Z'))

    expect(createValidationFailure('Missing data')).toEqual({
      timestamp: '2026-10-21T10:00:00.000Z',
      failure: 'Missing data',
      context: undefined
    })
  })
})
