import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  logValidationFailure
} from '../../src/helpers/validation-failures.js'

describe('#logValidationFailure', () => {
  let insertOne
  let server

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-16T12:45:16.789Z'))
    insertOne = vi.fn().mockResolvedValue({ acknowledged: true })
    server = {
      db: { collection: vi.fn().mockReturnValue({ insertOne }) },
      logger: { error: vi.fn() }
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('Stores the failure in the cph-validation-failures collection', async () => {
    const result = await logValidationFailure(server, 'abc123', 'Failure Description')
    const validationFailuresCollection = 'cph-validation-failures'

    expect(result).toBe(true)
    expect(server.db.collection).toHaveBeenCalledWith(validationFailuresCollection)
    expect(insertOne).toHaveBeenCalledWith({
      referenceNumber: 'abc123',
      timestamp: '2026-10-16T12:45:16.789Z',
      failure: 'Failure Description'
    })
    expect(server.logger.error).not.toHaveBeenCalled()
  })

  test('Logs and swallows a MongoDB failure', async () => {
    const databaseError = new Error('Database unavailable')
    insertOne.mockRejectedValue(databaseError)

    const result = await logValidationFailure(server, 'abc123', 'Failure Description')

    expect(result).toBe(false)
    expect(server.logger.error).toHaveBeenCalledWith(
      databaseError,
      'Failed to log validation failure for abc123'
    )
  })
})
