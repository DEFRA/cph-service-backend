import {
  afterAll,
  beforeAll,
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
import { validateRawSubmission } from '../../src/services/cph/validateRawSubmission.js'

vi.mock('../../src/services/cph/validateRawSubmission.js', () => ({
  validateRawSubmission: vi.fn()
}))

// TODO: extend mapping once data architects confirm destinations for party roles;
// title; postal address structure and UPRN; location identifiers, primary-location
// indicator and land ownership; country and hobbyist classification; additional
// information; and cattle details (count, purpose, ear tags, movement dates, vet info)

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

describe('mapDraftCphRecord', () => {
  test('sets the lifecycle status to Draft', () => {
    const draft = mapDraftCphRecord(rawSubmission, body)

    expect(draft.lifecycleStatus).toBe('Draft')
  })

  test('maps the source metadata from the raw submission', () => {
    const draft = mapDraftCphRecord(rawSubmission, body)

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
    const draft = mapDraftCphRecord(rawSubmission, body)

    expect(draft.livestockInformation.types).toEqual(['Cattle'])
  })

  test('maps the expected arrival date', () => {
    const draft = mapDraftCphRecord(rawSubmission, body)

    expect(draft.livestockInformation.expectedArrivalDate).toBe('2026-10-21')
  })

  test('accepts a submission without livestock answers', () => {
    const emptyBody = {
      meta: body.meta,
      data: {
        main: {}
      }
    }

    const rawSubmissionWithoutLivestock = {
      ...rawSubmission,
      body: JSON.stringify(emptyBody)
    }

    const draft = mapDraftCphRecord(rawSubmissionWithoutLivestock, emptyBody)

    expect(draft.lifecycleStatus).toBe('Draft')
    expect(draft.livestockInformation).toEqual({})
  })
})

describe('insertDraftCphRecord', () => {
  let server
  let collection

  beforeAll(async () => {
    const { createServer } = await import('#/server.js')

    server = await createServer()
    await server.initialize()
    collection = server.db.collection('cph-records')
  })

  beforeEach(async () => {
    await collection.deleteMany({})
    validateRawSubmission.mockReset()
    validateRawSubmission.mockResolvedValue(body)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-16T12:45:16.789Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  afterAll(async () => {
    await server.stop({ timeout: 1000 })
  })

  test('stores a draft CPH record linked to its raw submission', async () => {
    await insertDraftCphRecord(server, rawSubmission)

    const storedRecord = await collection.findOne({
      'source.rawSubmissionId': rawSubmission._id
    })

    expect(storedRecord).not.toBeNull()
    expect(storedRecord.lifecycleStatus).toBe('Draft')
    expect(storedRecord.source.applicationReference).toBe('WSP-ZSC-JJN')
    expect(storedRecord.livestockInformation.types).toEqual(['Cattle'])
    expect(storedRecord.livestockInformation.expectedArrivalDate).toBe('2026-10-21')
    expect(storedRecord.source.formId).toBe('6a980cc01db4dc2e19b44fdb')
    expect(storedRecord.source.formVersion).toBe(2)
    expect(storedRecord.source.submittedAt).toEqual(new Date('2026-10-08T08:39:38.073Z'))
    expect(storedRecord.source.receivedAt).toEqual(rawSubmission.receivedAt)
    expect(storedRecord.createdAt).toBeInstanceOf(Date)
    expect(storedRecord.modifiedAt).toEqual(storedRecord.createdAt)
    expect(storedRecord.createdBy).toEqual({
      identifier: 'cph-service-backend',
      name: 'CPH Service Backend'
    })
    expect(storedRecord.modifiedBy).toEqual(storedRecord.createdBy)
  })

  test('validates the parsed raw submission body', async () => {
    await insertDraftCphRecord(server, rawSubmission)

    expect(validateRawSubmission).toHaveBeenCalledWith(body, server)
  })

  test('throws and stores nothing when validation fails', async () => {
    validateRawSubmission.mockRejectedValue(new Error('Invalid submission'))

    await expect(insertDraftCphRecord(server, rawSubmission)).rejects.toThrow('Invalid submission')

    expect(await collection.countDocuments({})).toBe(0)
  })

  test('creates only one record when processed twice', async () => {
    await insertDraftCphRecord(server, rawSubmission)
    await insertDraftCphRecord(server, rawSubmission)

    expect(await collection.countDocuments({
      'source.rawSubmissionId': rawSubmission._id
    })).toBe(1)
  })

  test('preserves later changes when processed again', async () => {
    const filter = {
      'source.rawSubmissionId': rawSubmission._id
    }

    await insertDraftCphRecord(server, rawSubmission)

    await collection.updateOne(filter, {
      $set: {
        'livestockInformation.expectedArrivalDate': '2026-10-21'
      }
    })

    await insertDraftCphRecord(server, rawSubmission)

    const storedRecord = await collection.findOne(filter)
    expect(storedRecord.livestockInformation.expectedArrivalDate).toBe('2026-10-21')
  })

  test('rejects a duplicate raw submission link at database level', async () => {
    await insertDraftCphRecord(server, rawSubmission)

    await expect(collection.insertOne({
      lifecycleStatus: 'Draft',
      source: {
        rawSubmissionId: rawSubmission._id
      }
    })).rejects.toThrow(/E11000 duplicate key/i)
  })
})
