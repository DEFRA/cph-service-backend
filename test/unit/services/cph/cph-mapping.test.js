import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { mapLocations, mapDraftCphRecord } from '../../../../src/services/cph/cph-mapping.js'
import { validateRawSubmissionBody } from '../../../../src/services/cph/validateRawSubmission.js'
import { CPH_STATUS } from '../../../../src/services/cph/cph-parameters.js'

vi.mock('../../../../src/services/cph/validateRawSubmission.js', () => ({
  validateRawSubmissionBody: vi.fn()
}))

describe('mapLocations', () => {
  test('maps location eastings and northings correctly', () => {
    const locationData = [
      {
        UOmNur: {
          easting: 248741,
          northing: 63688
        }
      }
    ]

    const result = mapLocations(locationData)

    expect(result).toEqual([
      {
        easting: 248741,
        northing: 63688
      }
    ])
  })

  test('maps multiple locations correctly', () => {
    const locationData = [
      {
        UOmNur: {
          easting: 100,
          northing: 200
        }
      },
      {
        UOmNur: {
          easting: 300,
          northing: 400
        }
      },
      {
        UOmNur: {
          easting: 500,
          northing: 600
        }
      }
    ]

    const result = mapLocations(locationData)

    expect(result).toHaveLength(3)
    expect(result).toEqual([
      { easting: 100, northing: 200 },
      { easting: 300, northing: 400 },
      { easting: 500, northing: 600 }
    ])
  })

  test('returns empty array when given empty array', () => {
    const result = mapLocations([])

    expect(result).toEqual([])
  })

  test('extracts only easting and northing from location object', () => {
    const locationData = [
      {
        UOmNur: {
          easting: 100,
          northing: 200,
          extraField: 'should be ignored',
          anotherField: 'also ignored'
        }
      }
    ]

    const result = mapLocations(locationData)

    expect(result).toEqual([
      {
        easting: 100,
        northing: 200
      }
    ])
    expect(result[0]).not.toHaveProperty('extraField')
    expect(result[0]).not.toHaveProperty('anotherField')
  })
})

describe('mapDraftCphRecord', () => {
  let server
  let draft
  let submissionBody

  beforeEach(() => {
    server = {
      logger: {
        error: vi.fn()
      }
    }

    draft = {
      cphNumber: '',
      lifecycleStatus: CPH_STATUS.DRAFT,
      validationErrors: []
    }

    submissionBody = {
      data: {
        main: {
          vumpmr: ['Cattle', 'Sheep'],
          yDwSNa: {
            day: 15,
            month: 10,
            year: 2026
          },
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [
            {
              UOmNur: {
                easting: 248741,
                northing: 63688
              }
            },
            {
              UOmNur: {
                easting: 250000,
                northing: 65000
              }
            }
          ]
        }
      }
    }

    validateRawSubmissionBody.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when validation passes', () => {
    test('adds livestock information to draft when validation succeeds', async () => {
      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation).toBeDefined()
      expect(result.livestockInformation.types).toEqual(['Cattle', 'Sheep'])
      expect(result.livestockInformation.expectedArrivalDate).toEqual({
        day: 15,
        month: 10,
        year: 2026
      })
      expect(result.livestockInformation.landOwned).toBe(true)
    })

    test('maps locations correctly when validation succeeds', async () => {
      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation.locationEastingsAndNorthings).toEqual([
        {
          easting: 248741,
          northing: 63688
        },
        {
          easting: 250000,
          northing: 65000
        }
      ])
    })

    test('preserves draft properties when adding livestock information', async () => {
      draft.cphNumber = '12/345/0001'
      draft.lifecycleStatus = CPH_STATUS.ACTIVE

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.cphNumber).toBe('12/345/0001')
      expect(result.lifecycleStatus).toBe(CPH_STATUS.ACTIVE)
    })

    test('keeps lifecycle status as DRAFT when validation succeeds', async () => {
      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.lifecycleStatus).toBe(CPH_STATUS.DRAFT)
    })

    test('copies livestock types array to prevent mutation', async () => {
      const result = await mapDraftCphRecord(draft, submissionBody, server)

      result.livestockInformation.types.push('Pigs')
      expect(submissionBody.data.main.vumpmr).toEqual(['Cattle', 'Sheep'])
    })

    test('handles single location correctly', async () => {
      submissionBody.data.repeaters.hNCJCl = [
        {
          UOmNur: {
            easting: 100,
            northing: 200
          }
        }
      ]

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation.locationEastingsAndNorthings).toHaveLength(1)
      expect(result.livestockInformation.locationEastingsAndNorthings[0]).toEqual({
        easting: 100,
        northing: 200
      })
    })

    test('handles empty livestock types as empty array', async () => {
      submissionBody.data.main.vumpmr = undefined

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation.types).toEqual([])
    })

    test('handles non-array livestock types as empty array', async () => {
      submissionBody.data.main.vumpmr = 'not-an-array'

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation.types).toEqual([])
    })

    test('handles falsy landOwned value', async () => {
      submissionBody.data.main.rOgnUv = false

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation.landOwned).toBe(false)
    })

    test('calls validateRawSubmissionBody with correct parameters', async () => {
      await mapDraftCphRecord(draft, submissionBody, server)

      expect(validateRawSubmissionBody).toHaveBeenCalledWith(submissionBody, server)
      expect(validateRawSubmissionBody).toHaveBeenCalledTimes(1)
    })
  })

  describe('when validation fails', () => {
    test('sets lifecycle status to MANUAL_REVIEW when validation errors exist', async () => {
      const validationErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: '"data.main.vumpmr" must contain at least 1 items',
          context: { key: 'vumpmr' }
        }
      ]
      validateRawSubmissionBody.mockResolvedValue(validationErrors)

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.lifecycleStatus).toBe(CPH_STATUS.MANUAL_REVIEW)
    })

    test('adds validation errors to draft validationErrors array', async () => {
      const validationErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'error 1',
          context: {}
        },
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'error 2',
          context: {}
        }
      ]
      validateRawSubmissionBody.mockResolvedValue(validationErrors)

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.validationErrors).toEqual(validationErrors)
    })

    test('returns draft without livestock information when validation fails', async () => {
      const validationErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'validation failed',
          context: {}
        }
      ]
      validateRawSubmissionBody.mockResolvedValue(validationErrors)

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.livestockInformation).toBeUndefined()
    })

    test('stops processing immediately when validation errors exist', async () => {
      const validationErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'validation failed',
          context: {}
        }
      ]
      validateRawSubmissionBody.mockResolvedValue(validationErrors)

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.lifecycleStatus).toBe(CPH_STATUS.MANUAL_REVIEW)
      expect(result.livestockInformation).toBeUndefined()
    })

    test('preserves existing validationErrors and appends new ones', async () => {
      draft.validationErrors = [
        {
          timestamp: '2026-10-08T10:00:00.000Z',
          failure: 'existing error',
          context: {}
        }
      ]

      const newValidationErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'new error',
          context: {}
        }
      ]
      validateRawSubmissionBody.mockResolvedValue(newValidationErrors)

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.validationErrors).toHaveLength(2)
      expect(result.validationErrors[0].failure).toBe('existing error')
      expect(result.validationErrors[1].failure).toBe('new error')
    })
  })

  describe('edge cases', () => {
    test('throws when data object is missing', async () => {
      submissionBody.data = undefined

      await expect(mapDraftCphRecord(draft, submissionBody, server)).rejects.toThrow(TypeError)
    })

    test('throws when main object is missing', async () => {
      submissionBody.data.main = undefined

      await expect(mapDraftCphRecord(draft, submissionBody, server)).rejects.toThrow(TypeError)
    })

    test('throws when repeaters object is missing', async () => {
      submissionBody.data.repeaters = undefined

      await expect(mapDraftCphRecord(draft, submissionBody, server)).rejects.toThrow(TypeError)
    })

    test('does not mutate the original draft object', async () => {
      const originalDraft = { ...draft, validationErrors: [...draft.validationErrors] }

      await mapDraftCphRecord(draft, submissionBody, server)

      expect(draft.lifecycleStatus).toBe(originalDraft.lifecycleStatus)
      expect(draft.validationErrors).toEqual(originalDraft.validationErrors)
    })

    test('returns new object with spread draft properties', async () => {
      draft.customProperty = 'should be preserved'

      const result = await mapDraftCphRecord(draft, submissionBody, server)

      expect(result.customProperty).toBe('should be preserved')
    })
  })
})
