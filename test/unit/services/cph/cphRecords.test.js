import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { insertDraftCphRecord } from '../../../../src/services/cph/cphRecords.js'
import { validateRawSubmissionMeta } from '../../../../src/services/cph/validateRawSubmission.js'
import { createValidationFailure } from '../../../../src/helpers/validation-failure.js'
import { processCphRecord } from '../../../../src/services/cph/process-cph.js'
import { mapDraftCphRecord } from '../../../../src/services/cph/cph-mapping.js'
import { CPH_STATUS } from '../../../../src/services/cph/cph-parameters.js'

vi.mock('../../../../src/services/cph/validateRawSubmission.js', () => ({
  validateRawSubmissionMeta: vi.fn()
}))

vi.mock('../../../../src/helpers/validation-failure.js', () => ({
  createValidationFailure: vi.fn((message, context) => ({
    timestamp: new Date().toISOString(),
    failure: message,
    context
  }))
}))

vi.mock('../../../../src/services/cph/process-cph.js', () => ({
  processCphRecord: vi.fn()
}))

vi.mock('../../../../src/services/cph/cph-mapping.js', () => ({
  mapDraftCphRecord: vi.fn()
}))

describe('insertDraftCphRecord', () => {
  let server
  let rawSubmission

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-09T10:00:00.000Z'))
    vi.clearAllMocks()

    server = {
      db: {
        collection: vi.fn().mockReturnValue({
          updateOne: vi.fn().mockResolvedValue({ acknowledged: true })
        })
      },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    rawSubmission = {
      _id: '6ac756ca3fce9c6b24472281',
      referenceNumber: 'WSP-ZSC-JJN',
      formId: '6a980cc01db4dc2e19b44fdb',
      receivedAt: new Date('2026-10-08T08:39:38.363Z'),
      body: JSON.stringify({
        meta: {
          schemaVersion: 1,
          timestamp: '2026-10-08T08:39:38.073Z',
          referenceNumber: 'WSP-ZSC-JJN',
          formId: '6a980cc01db4dc2e19b44fdb',
          versionMetadata: {
            versionNumber: 2,
            createdAt: '2026-09-02T13:57:07.816Z'
          }
        },
        data: {
          main: {
            vumpmr: ['Cattle'],
            yDwSNa: { day: 21, month: 10, year: 2026 },
            rOgnUv: true
          },
          repeaters: {
            hNCJCl: [
              {
                UOmNur: {
                  easting: 248741,
                  northing: 63688
                }
              }
            ]
          }
        }
      })
    }

    validateRawSubmissionMeta.mockResolvedValue([])
    mapDraftCphRecord.mockImplementation((draft) => Promise.resolve(draft))
    processCphRecord.mockImplementation((server, draft) => Promise.resolve(draft))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful record insertion', () => {
    test('creates a draft record with source information', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      expect(updateOne).toHaveBeenCalled()

      const call = updateOne.mock.calls[0]
      const insertedRecord = call[1].$setOnInsert

      expect(insertedRecord.source.rawSubmissionId).toBe(rawSubmission._id)
      expect(insertedRecord.source.receivedAt).toEqual(rawSubmission.receivedAt)
      expect(insertedRecord.source.formId).toBe('6a980cc01db4dc2e19b44fdb')
    })

    test('sets initial lifecycle status to DRAFT', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.lifecycleStatus).toBe(CPH_STATUS.DRAFT)
    })

    test('sets cphNumber to empty string initially', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.cphNumber).toBe('')
    })

    test('records creation and modification metadata', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.createdAt).toEqual(new Date('2026-10-09T10:00:00.000Z'))
      expect(insertedRecord.modifiedAt).toEqual(new Date('2026-10-09T10:00:00.000Z'))
      expect(insertedRecord.createdBy).toEqual({
        identifier: 'cph-service-backend',
        name: 'CPH Service Backend'
      })
      expect(insertedRecord.modifiedBy).toEqual({
        identifier: 'cph-service-backend',
        name: 'CPH Service Backend'
      })
    })

    test('uses upsert to avoid duplicates', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const options = updateOne.mock.calls[0][2]

      expect(options.upsert).toBe(true)
    })

    test('queries by rawSubmissionId', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const filter = updateOne.mock.calls[0][0]

      expect(filter).toEqual({ 'source.rawSubmissionId': rawSubmission._id })
    })

    test('calls mapDraftCphRecord when body parsing succeeds', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      expect(mapDraftCphRecord).toHaveBeenCalled()
    })

    test('calls processCphRecord when not in MANUAL_REVIEW status', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      expect(processCphRecord).toHaveBeenCalled()
    })

    test('skips processCphRecord when in MANUAL_REVIEW status', async () => {
      mapDraftCphRecord.mockImplementation((draft) => {
        draft.lifecycleStatus = CPH_STATUS.MANUAL_REVIEW
        return Promise.resolve(draft)
      })

      await insertDraftCphRecord(server, rawSubmission)

      expect(processCphRecord).not.toHaveBeenCalled()
    })

    test('validates meta information', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const body = JSON.parse(rawSubmission.body)
      expect(validateRawSubmissionMeta).toHaveBeenCalledWith(body, server)
    })
  })

  describe('JSON parsing', () => {
    test('parses JSON body successfully', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      expect(createValidationFailure).not.toHaveBeenCalledWith(
        'Failed to parse raw submission body',
        expect.anything()
      )
    })

    test('creates validation failure when body is invalid JSON', async () => {
      rawSubmission.body = '{not-valid-json'

      await insertDraftCphRecord(server, rawSubmission)

      expect(createValidationFailure).toHaveBeenCalledWith(
        'Failed to parse raw submission body',
        rawSubmission.body
      )
    })

    test('skips mapDraftCphRecord when JSON parsing fails', async () => {
      rawSubmission.body = '{not-valid-json'

      await insertDraftCphRecord(server, rawSubmission)

      expect(mapDraftCphRecord).not.toHaveBeenCalled()
    })

    test('validates empty object when body parsing fails', async () => {
      rawSubmission.body = '{not-valid-json'

      await insertDraftCphRecord(server, rawSubmission)

      expect(validateRawSubmissionMeta).toHaveBeenCalledWith({}, server)
    })

    test('includes parse failure in validationErrors', async () => {
      rawSubmission.body = '{not-valid-json'

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      const parseError = insertedRecord.validationErrors.find(e => e.failure === 'Failed to parse raw submission body')
      expect(parseError).toBeDefined()
      expect(parseError.context).toBe(rawSubmission.body)
    })
  })

  describe('timestamp handling', () => {
    test('uses submission timestamp when valid', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.submittedAt).toEqual(new Date('2026-10-08T08:39:38.073Z'))
    })

    test('uses current time when submission timestamp is invalid', async () => {
      const body = JSON.parse(rawSubmission.body)
      body.meta.timestamp = 'not-a-date'
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.submittedAt).toEqual(new Date('2026-10-09T10:00:00.000Z'))
    })

    test('uses current time when submission timestamp is missing', async () => {
      const body = JSON.parse(rawSubmission.body)
      delete body.meta.timestamp
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.submittedAt).toEqual(new Date('2026-10-09T10:00:00.000Z'))
    })
  })

  describe('meta information extraction', () => {
    test('extracts referenceNumber from meta', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.applicationReference).toBe('WSP-ZSC-JJN')
    })

    test('uses Unknown when referenceNumber is missing', async () => {
      const body = JSON.parse(rawSubmission.body)
      delete body.meta.referenceNumber
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.applicationReference).toBe('Unknown')
    })

    test('extracts formId from meta', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.formId).toBe('6a980cc01db4dc2e19b44fdb')
    })

    test('uses Unknown when formId is missing', async () => {
      const body = JSON.parse(rawSubmission.body)
      delete body.meta.formId
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.formId).toBe('Unknown')
    })

    test('extracts formVersion from versionMetadata', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.formVersion).toBe(2)
    })

    test('uses Unknown when versionNumber is missing', async () => {
      const body = JSON.parse(rawSubmission.body)
      delete body.meta.versionMetadata.versionNumber
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.formVersion).toBe('Unknown')
    })
  })

  describe('error handling', () => {
    test('logs and rethrows database insert errors', async () => {
      const dbError = new Error('Database connection failed')
      server.db.collection('cph-records').updateOne.mockRejectedValue(dbError)

      await expect(insertDraftCphRecord(server, rawSubmission)).rejects.toThrow('Database connection failed')

      expect(server.logger.error).toHaveBeenCalledWith(dbError, 'Failed to insert draft CPH record:')
    })

    test('catches processCphRecord errors and sets status to MANUAL_REVIEW', async () => {
      const processError = new Error('Failed to generate CPH number')
      processCphRecord.mockRejectedValue(processError)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.lifecycleStatus).toBe(CPH_STATUS.MANUAL_REVIEW)
    })

    test('logs processCphRecord errors', async () => {
      const processError = new Error('Processing failed')
      processCphRecord.mockRejectedValue(processError)

      await insertDraftCphRecord(server, rawSubmission)

      expect(server.logger.error).toHaveBeenCalledWith(processError, 'Failed to process CPH record:')
    })

    test('adds processCphRecord error to validationErrors', async () => {
      const processError = new Error('Processing failed')
      processCphRecord.mockRejectedValue(processError)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      const processFailureError = insertedRecord.validationErrors.find(e => e.failure === 'Failed to process CPH record:')
      expect(processFailureError).toBeDefined()
      expect(processFailureError.context.message).toBe('Processing failed')
    })

    test('continues to database insert even if processCphRecord fails', async () => {
      processCphRecord.mockRejectedValue(new Error('Processing failed'))

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      expect(updateOne).toHaveBeenCalled()
    })
  })

  describe('validation error accumulation', () => {
    test('accumulates meta validation errors', async () => {
      const metaErrors = [
        {
          timestamp: '2026-10-09T10:00:00.000Z',
          failure: 'Meta error 1',
          context: {}
        }
      ]
      validateRawSubmissionMeta.mockResolvedValue(metaErrors)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.validationErrors).toContainEqual(expect.objectContaining({
        failure: 'Meta error 1'
      }))
    })

    test('accumulates multiple validation errors', async () => {
      const metaErrors = [
        { timestamp: '2026-10-09T10:00:00.000Z', failure: 'Meta error', context: {} }
      ]
      validateRawSubmissionMeta.mockResolvedValue(metaErrors)

      const processError = new Error('Processing error')
      processCphRecord.mockRejectedValue(processError)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.validationErrors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('edge cases', () => {
    test('handles rawSubmission with missing _id', async () => {
      rawSubmission._id = undefined

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const filter = updateOne.mock.calls[0][0]

      expect(filter).toEqual({ 'source.rawSubmissionId': undefined })
    })

    test('handles rawSubmission with missing receivedAt', async () => {
      rawSubmission.receivedAt = undefined

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.receivedAt).toBeUndefined()
    })

    test('handles submission body with null meta', async () => {
      const body = JSON.parse(rawSubmission.body)
      body.meta = null
      rawSubmission.body = JSON.stringify(body)

      await insertDraftCphRecord(server, rawSubmission)

      const updateOne = server.db.collection('cph-records').updateOne
      const insertedRecord = updateOne.mock.calls[0][1].$setOnInsert

      expect(insertedRecord.source.applicationReference).toBe('Unknown')
      expect(insertedRecord.source.formId).toBe('Unknown')
    })

    test('uses cph-records collection', async () => {
      await insertDraftCphRecord(server, rawSubmission)

      expect(server.db.collection).toHaveBeenCalledWith('cph-records')
    })
  })
})
