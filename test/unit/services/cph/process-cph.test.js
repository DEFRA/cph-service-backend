import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { processCphRecord } from '../../../../src/services/cph/process-cph.js'
import { generateCphNumber } from '../../../../src/services/cph/cph-number.js'
import { CPH_STATUS } from '../../../../src/services/cph/cph-parameters.js'

vi.mock('../../../../src/services/cph/cph-number.js', () => ({
  generateCphNumber: vi.fn()
}))

function createServer () {
  return { logger: { error: vi.fn() } }
}

function createDraft (livestockInformation = {}) {
  return {
    cphNumber: '',
    lifecycleStatus: CPH_STATUS.DRAFT,
    livestockInformation: {
      landOwned: true,
      locationEastingsAndNorthings: [
        { easting: 100, northing: 200 },
        { easting: 300, northing: 400 }
      ],
      ...livestockInformation
    }
  }
}

describe('processCphRecord', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns the draft unchanged when land is not owned', async () => {
    const draft = createDraft({ landOwned: false })

    const result = await processCphRecord(createServer(), draft)

    expect(result).toBe(draft)
    expect(result.lifecycleStatus).toBe(CPH_STATUS.DRAFT)
    expect(result.cphNumber).toBe('')
    expect(generateCphNumber).not.toHaveBeenCalled()
  })

  test('generates a CPH number from the first location and activates the record when land is owned', async () => {
    const server = createServer()
    generateCphNumber.mockResolvedValue('12/345/0001')

    const result = await processCphRecord(server, createDraft())

    expect(generateCphNumber).toHaveBeenCalledWith(server, 100, 200)
    expect(result.cphNumber).toBe('12/345/0001')
    expect(result.lifecycleStatus).toBe(CPH_STATUS.ACTIVE)
    expect(result.startDate).toBe('2026-01-02T03:04:05.000Z')
  })

  test('logs and rethrows when CPH number generation fails', async () => {
    const server = createServer()
    const error = new Error('no parish')
    generateCphNumber.mockRejectedValue(error)

    await expect(processCphRecord(server, createDraft())).rejects.toThrow('no parish')
    expect(server.logger.error).toHaveBeenCalledWith(error, 'Failed to process permanent CPH workflow:')
  })

  test('logs and rethrows when there are no locations', async () => {
    const server = createServer()
    const draft = createDraft({ locationEastingsAndNorthings: [] })

    await expect(processCphRecord(server, draft)).rejects.toThrow(TypeError)
    expect(server.logger.error).toHaveBeenCalled()
    expect(generateCphNumber).not.toHaveBeenCalled()
  })
})
