import { beforeEach, expect, test, vi } from 'vitest'

import { insertRawFormSubmission } from '../../src/services/rawFormSubmissions.js'

const collectionName = 'raw-form-submissions'
const referenceNumber = 'TEST-REF-001'
const formId = 'test-form-id'

function createBody (answer = 'first test value') {
  return JSON.stringify({
    meta: {
      referenceNumber,
      formId
    },
    data: {
      main: {
        inventedAnswer: answer
      }
    }
  })
}

describe('#insertRawFormSubmission', () => {
  let updateOne
  let db

  beforeEach(() => {
    updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    db = {
      collection: vi.fn().mockReturnValue({ updateOne })
    }
  })

  test('Stores the complete original body', async () => {
    const body = createBody()

    await insertRawFormSubmission(db, body)

    expect(db.collection).toHaveBeenCalledWith(collectionName)
    expect(updateOne).toHaveBeenCalledWith(
      { referenceNumber },
      {
        $setOnInsert: {
          referenceNumber,
          formId,
          receivedAt: expect.any(Date),
          body
        }
      },
      { upsert: true }
    )
  })

  test('Does not overwrite an existing record for the same reference number', async () => {
    const firstBody = createBody('first test value')
    const secondBody = createBody('changed test value')

    await insertRawFormSubmission(db, firstBody)
    await insertRawFormSubmission(db, secondBody)

    expect(updateOne).toHaveBeenCalledTimes(2)
    expect(updateOne.mock.calls[0][0]).toEqual({ referenceNumber })
    expect(updateOne.mock.calls[0][2]).toEqual({ upsert: true })
  })

  test('Rejects malformed JSON without storing it', async () => {
    expect(() => insertRawFormSubmission(db, '{invalid')).toThrow()
    expect(db.collection).not.toHaveBeenCalled()
  })

  test('Rejects a submission without a reference number', async () => {
    const body = JSON.stringify({ meta: { formId } })

    expect(() => insertRawFormSubmission(db, body)).toThrow(
      'Form submission is missing meta.referenceNumber'
    )
    expect(db.collection).not.toHaveBeenCalled()
  })

  test('Propagates a MongoDB failure', async () => {
    const databaseError = new Error('Database unavailable')
    updateOne.mockRejectedValue(databaseError)

    await expect(
      insertRawFormSubmission(db, createBody())
    ).rejects.toThrow('Database unavailable')
  })
})
