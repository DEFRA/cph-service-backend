import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'

import {
  insertDraftCphRecord,
  mapDraftCphRecord
} from '../../src/services/cphRecords.js'

// TODO: extend mapping once data architects confirm destinations for party roles;
// title; postal address structure and UPRN; location identifiers, primary-location
// indicator and land ownership; country and hobbyist classification; additional
// information; and cattle details (count, purpose, ear tags, movement dates, vet info)

vi.mock('#/plugins/map-data.js', () => ({
  mapData: {
    plugin: {
      name: 'map-data',
      version: '1.0.0',
      register: async () => {}
    }
  }
}))

const rawSubmission = {
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
        yDwSNa: { day: 11, month: 10, year: 2026 }
      }
    }
  })
}

describe('mapDraftCphRecord', () => {
  test('sets the lifecycle status to Draft', () => {
    const draft = mapDraftCphRecord(rawSubmission)

    expect(draft.lifecycleStatus).toBe('Draft')
  })

  test('maps the source metadata from the raw submission', () => {
    const draft = mapDraftCphRecord(rawSubmission)

    expect(draft.source).toEqual({
      rawSubmissionId: rawSubmission._id,
      applicationReference: 'WSP-ZSC-JJN',
      formId: '6a980cc01db4dc2e19b44fdb',
      formVersion: 2,
      submittedAt: new Date('2026-10-08T08:39:38.073Z'),
      receivedAt: rawSubmission.receivedAt
    })
  })

  test('maps the livestock types', () => {
    const draft = mapDraftCphRecord(rawSubmission)

    expect(draft.livestockInformation.types).toEqual(['Cattle'])
  })

  test('maps the expected arrival date', () => {
    const draft = mapDraftCphRecord(rawSubmission)

    expect(draft.livestockInformation.expectedArrivalDate).toBe('2026-10-11')
  })

  test.each([undefined, null, '', '   ', 'not-a-date'])(
    'throws an error for invalid submission timestamp: %p',
    (invalidTimestamp) => {
      const rawSubmissionWithInvalidTimestamp = {
        ...rawSubmission,
        body: JSON.stringify({
          ...JSON.parse(rawSubmission.body),
          meta: {
            ...JSON.parse(rawSubmission.body).meta,
            timestamp: invalidTimestamp
          }
        })
      }

      expect(() => mapDraftCphRecord(rawSubmissionWithInvalidTimestamp)).toThrow(
        'Missing or invalid submission timestamp'
      )
    }
  )

  test('accepts a submission without livestock answers', () => {
    const rawSubmissionWithoutLivestock = {
      ...rawSubmission,
      body: JSON.stringify({
        meta: JSON.parse(rawSubmission.body).meta,
        data: {
          main: {}
        }
      })
    }

    const draft = mapDraftCphRecord(rawSubmissionWithoutLivestock)

    expect(draft.lifecycleStatus).toBe('Draft')
    expect(draft.livestockInformation).toEqual({})
  })
})

describe('insertDraftCphRecord', () => {
  let updateOne
  let db

  beforeEach(() => {
    updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    db = {
      collection: vi.fn().mockReturnValue({ updateOne })
    }
  })

  test('stores a draft CPH record linked to its raw submission', async () => {
    await insertDraftCphRecord(db, rawSubmission)

    expect(db.collection).toHaveBeenCalledWith('cph-records')
    expect(updateOne).toHaveBeenCalledWith(
      { 'source.rawSubmissionId': rawSubmission._id },
      {
        $setOnInsert: expect.objectContaining({
          lifecycleStatus: 'Draft',
          source: expect.objectContaining({
            rawSubmissionId: rawSubmission._id,
            applicationReference: 'WSP-ZSC-JJN',
            formId: '6a980cc01db4dc2e19b44fdb',
            formVersion: 2,
            submittedAt: new Date('2026-10-08T08:39:38.073Z'),
            receivedAt: rawSubmission.receivedAt
          }),
          livestockInformation: expect.objectContaining({
            types: ['Cattle'],
            expectedArrivalDate: '2026-10-11'
          }),
          createdAt: expect.any(Date),
          createdBy: {
            identifier: 'cph-service-backend',
            name: 'CPH Service Backend'
          },
          modifiedAt: expect.any(Date),
          modifiedBy: {
            identifier: 'cph-service-backend',
            name: 'CPH Service Backend'
          }
        })
      },
      { upsert: true }
    )
  })

  test('creates only one record when processed twice', async () => {
    await insertDraftCphRecord(db, rawSubmission)
    await insertDraftCphRecord(db, rawSubmission)

    expect(updateOne).toHaveBeenCalledTimes(2)
    expect(updateOne.mock.calls[0][0]).toEqual({
      'source.rawSubmissionId': rawSubmission._id
    })
    expect(updateOne.mock.calls[0][2]).toEqual({ upsert: true })
  })

  test('preserves later changes when processed again', async () => {
    const dbWithExistingUpdate = {
      collection: vi.fn().mockReturnValue({
        updateOne: vi.fn().mockResolvedValue({ acknowledged: true })
      })
    }

    await insertDraftCphRecord(dbWithExistingUpdate, rawSubmission)

    expect(dbWithExistingUpdate.collection).toHaveBeenCalledWith('cph-records')
  })

  test('rejects a duplicate raw submission link at database level', async () => {
    const databaseError = new Error('Database unavailable')
    updateOne.mockRejectedValue(databaseError)

    await expect(insertDraftCphRecord(db, rawSubmission)).rejects.toThrow(
      'Database unavailable'
    )
  })
})
