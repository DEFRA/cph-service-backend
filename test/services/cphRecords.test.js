import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { insertDraftCphRecord } from '../../src/services/cphRecords.js'
import {
  validateRawSubmissionBody,
  validateRawSubmissionMeta
} from '../../src/services/cph/validateRawSubmission.js'
import * as validationFailureModule from '../../src/helpers/validation-failure.js'

vi.mock('../../src/services/cph/validateRawSubmission.js', () => ({
  validateRawSubmissionBody: vi.fn(),
  validateRawSubmissionMeta: vi.fn()
}))

const body = {
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
      yDwSNa: { day: 21, month: 10, year: 2026 }
    }
  }
}

const rawSubmission = {
  _id: '6ac756ca3fce9c6b24472281',
  referenceNumber: 'WSP-ZSC-JJN',
  formId: '6a980cc01db4dc2e19b44fdb',
  receivedAt: new Date('2026-10-08T08:39:38.363Z'),
  body: JSON.stringify(body)
}

const now = new Date('2026-10-09T10:00:00.000Z')
const actor = {
  identifier: 'cph-service-backend',
  name: 'CPH Service Backend'
}

describe('insertDraftCphRecord', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    vi.clearAllMocks()
    vi.spyOn(validationFailureModule, 'createValidationFailure')
    validateRawSubmissionMeta.mockResolvedValue([])
    validateRawSubmissionBody.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('creates a draft record and validates both meta and body data', async () => {
    const metaErrors = [{
      timestamp: '2026-10-09T10:00:00.000Z',
      failure: '"meta.referenceNumber" is required',
      context: { key: 'referenceNumber', label: 'referenceNumber' }
    }]
    const bodyErrors = [{
      timestamp: '2026-10-09T10:00:00.000Z',
      failure: '"data.main.vumpmr" must contain at least 1 items',
      context: { key: 'vumpmr', label: 'vumpmr' }
    }]

    validateRawSubmissionMeta.mockResolvedValue(metaErrors)
    validateRawSubmissionBody.mockResolvedValue(bodyErrors)

    const updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    const server = {
      db: { collection: vi.fn(() => ({ updateOne })) },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    await insertDraftCphRecord(server, rawSubmission)

    expect(validateRawSubmissionMeta).toHaveBeenCalledWith(body, server)
    expect(validateRawSubmissionBody).toHaveBeenCalledWith(body, server)
    expect(server.db.collection).toHaveBeenCalledWith('cph-records')

    expect(updateOne).toHaveBeenCalledWith(
      { 'source.rawSubmissionId': rawSubmission._id },
      {
        $setOnInsert: expect.objectContaining({
          lifecycleStatus: 'Draft',
          source: expect.objectContaining({
            rawSubmissionId: rawSubmission._id,
            receivedAt: rawSubmission.receivedAt,
            applicationReference: body.meta.referenceNumber,
            formId: body.meta.formId,
            formVersion: body.meta.versionMetadata.versionNumber,
            submittedAt: new Date(body.meta.timestamp)
          }),
          createdAt: now,
          createdBy: actor,
          modifiedAt: now,
          modifiedBy: actor,
          validationErrors: [...metaErrors, ...bodyErrors],
          livestockInformation: {
            types: ['Cattle'],
            expectedArrivalDate: body.data.main.yDwSNa
          }
        })
      },
      { upsert: true }
    )
  })

  test('adds a parse failure when the raw submission body is invalid JSON', async () => {
    const invalidRawSubmission = {
      ...rawSubmission,
      body: '{not-valid-json'
    }

    const updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    const server = {
      db: { collection: vi.fn(() => ({ updateOne })) },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    await insertDraftCphRecord(server, invalidRawSubmission)

    expect(validationFailureModule.createValidationFailure).toHaveBeenCalledWith(
      'Failed to parse raw submission body',
      invalidRawSubmission.body
    )
    expect(validateRawSubmissionMeta).toHaveBeenCalledWith({}, server)
    expect(validateRawSubmissionBody).not.toHaveBeenCalled()

    expect(updateOne).toHaveBeenCalledWith(
      { 'source.rawSubmissionId': invalidRawSubmission._id },
      {
        $setOnInsert: expect.objectContaining({
          lifecycleStatus: 'Draft',
          source: expect.objectContaining({
            rawSubmissionId: invalidRawSubmission._id,
            receivedAt: invalidRawSubmission.receivedAt,
            applicationReference: 'Unknown',
            formId: 'Unknown',
            formVersion: 'Unknown',
            submittedAt: now
          }),
          validationErrors: [
            {
              timestamp: now.toISOString(),
              failure: 'Failed to parse raw submission body',
              context: invalidRawSubmission.body
            }
          ]
        })
      },
      { upsert: true }
    )
  })

  test('uses the current time when the submission timestamp is invalid', async () => {
    const bodyWithInvalidTimestamp = {
      ...body,
      meta: {
        ...body.meta,
        timestamp: 'not-a-date'
      }
    }

    validateRawSubmissionMeta.mockResolvedValue([])
    validateRawSubmissionBody.mockResolvedValue([])

    const updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    const server = {
      db: { collection: vi.fn(() => ({ updateOne })) },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    await insertDraftCphRecord(server, { ...rawSubmission, body: JSON.stringify(bodyWithInvalidTimestamp) })

    expect(updateOne).toHaveBeenCalledWith(
      { 'source.rawSubmissionId': rawSubmission._id },
      {
        $setOnInsert: expect.objectContaining({
          source: expect.objectContaining({
            submittedAt: now
          })
        })
      },
      { upsert: true }
    )
  })

  test('rethrows database insert errors and logs them', async () => {
    const dbError = new Error('Mongo insert failed')
    validateRawSubmissionMeta.mockResolvedValue([])
    validateRawSubmissionBody.mockResolvedValue([])

    const updateOne = vi.fn().mockRejectedValue(dbError)
    const server = {
      db: { collection: vi.fn(() => ({ updateOne })) },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    await expect(insertDraftCphRecord(server, rawSubmission)).rejects.toThrow('Mongo insert failed')
    expect(server.logger.error).toHaveBeenCalledWith(dbError, 'Failed to insert draft CPH record:')
  })
})
