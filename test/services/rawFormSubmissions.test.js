import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
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
  let server
  let collection

  beforeAll(async () => {
    // Dynamic import needed due to config being updated by vitest-mongodb
    const { createServer } = await import('#/server.js')

    server = await createServer()
    await server.initialize()
    collection = server.db.collection(collectionName)
  })

  beforeEach(async () => {
    await collection.deleteMany({})
  })

  afterAll(async () => {
    await server.stop({ timeout: 1000 })
  })

  test('Stores the complete original body', async () => {
    const body = createBody()

    await insertRawFormSubmission(server, body)

    const storedSubmission = await collection.findOne({ referenceNumber })

    expect(storedSubmission.referenceNumber).toBe(referenceNumber)
    expect(storedSubmission.formId).toBe(formId)
    expect(storedSubmission.receivedAt).toBeInstanceOf(Date)
    expect(storedSubmission.body).toBe(body)
  })

  test('Does not duplicate or overwrite a record delivered twice', async () => {
    const firstBody = createBody('first test value')
    const secondBody = createBody('changed test value')

    await insertRawFormSubmission(server, firstBody)
    await insertRawFormSubmission(server, secondBody)

    const storedSubmissions = await collection
      .find({ referenceNumber })
      .toArray()

    expect(storedSubmissions).toHaveLength(1)
    expect(storedSubmissions[0].body).toBe(firstBody)
  })

  test('Enforces a unique reference number at the database level', async () => {
    const firstBody = createBody('first test value')
    const secondBody = createBody('changed test value')

    await insertRawFormSubmission(server, firstBody)

    await expect(collection.insertOne({
      referenceNumber,
      formId,
      receivedAt: new Date(),
      body: secondBody
    })).rejects.toThrow(/E11000|duplicate key/i)

    const storedSubmissions = await collection
      .find({ referenceNumber })
      .toArray()

    expect(storedSubmissions).toHaveLength(1)
    expect(storedSubmissions[0].body).toBe(firstBody)
  })

  test('Rejects malformed JSON without storing it', async () => {
    expect(() => insertRawFormSubmission(server, '{invalid')).toThrow()

    expect(await collection.countDocuments()).toBe(0)
  })

  test('Rejects a submission without a reference number', async () => {
    const body = JSON.stringify({ meta: { formId } })

    expect(() => insertRawFormSubmission(server, body)).toThrow(
      'Form submission is missing meta.referenceNumber'
    )

    expect(await collection.countDocuments()).toBe(0)
  })

  test('Propagates a MongoDB failure', async () => {
    const databaseError = new Error('Database unavailable')
    const updateOne = vi.fn().mockRejectedValue(databaseError)
    const server = {
      db: {
        collection: vi.fn().mockReturnValue({ updateOne })
      }
    }

    await expect(
      insertRawFormSubmission(server, createBody())
    ).rejects.toThrow('Database unavailable')
  })
})
