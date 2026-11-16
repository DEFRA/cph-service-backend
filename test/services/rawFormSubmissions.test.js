import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { insertRawFormSubmission } from '../../src/services/rawFormSubmissions.js'

vi.mock('#/plugins/cph-map-data/index.js', () => ({
  mapData: {
    plugin: {
      name: 'map-data',
      version: '1.0.0',
      register: async () => {}
    }
  }
}))

const collectionName = 'raw-form-submissions'
const referenceNumber = 'TEST-REF-001'
const formId = 'test-form-id'

function createMessage (answer, messageId = `message-${Math.random().toString(36).substring(2, 15)}`) {
  return {
    MessageId: messageId,
    Body: createBody(answer)
  }
}

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
    await server?.stop({ timeout: 1000 })
  })

  test('Stores the complete original body', async () => {
    const message = createMessage()

    const insertedId = await insertRawFormSubmission(server, message)

    const storedSubmission = await collection.findOne({ messageId: insertedId.messageId })

    expect(insertedId.messageId).toEqual(storedSubmission.messageId)
    expect(storedSubmission.receivedAt).toBeInstanceOf(Date)
    expect(storedSubmission.body).toBe(message.Body)
  })

  test('Does not duplicate or overwrite a record delivered twice', async () => {
    const firstMessage = createMessage('first test value')
    const secondMessage = createMessage('changed test value', firstMessage.MessageId)

    const fistStoredSubmission = await insertRawFormSubmission(server, firstMessage)
    const secondStoredSubmission = await insertRawFormSubmission(server, secondMessage)
    expect(fistStoredSubmission.messageId).toEqual(secondStoredSubmission.messageId)

    const storedSubmissions = await collection
      .find({ messageId: firstMessage.MessageId })
      .toArray()

    expect(storedSubmissions).toHaveLength(1)
    expect(storedSubmissions[0].body).toBe(firstMessage.Body)
  })

  test('Enforces a unique message ID at the database level', async () => {
    const firstMessage = createMessage('first test value')
    const secondMessage = createMessage('changed test value', firstMessage.MessageId)

    await insertRawFormSubmission(server, firstMessage)

    await expect(collection.insertOne({
      messageId: secondMessage.MessageId,
      receivedAt: new Date(),
      body: secondMessage
    })).rejects.toThrow(/E11000|duplicate key/i)

    const storedSubmissions = await collection
      .find({ messageId: firstMessage.MessageId })
      .toArray()

    expect(storedSubmissions).toHaveLength(1)
    expect(storedSubmissions[0].body).toBe(firstMessage.Body)
  })

  test('Propagates a MongoDB failure', async () => {
    const databaseError = new Error('Database unavailable')
    const updateOne = vi.fn().mockRejectedValue(databaseError)
    const server = {
      db: {
        collection: vi.fn().mockReturnValue({ updateOne })
      },
      logger: {
        error: vi.fn()
      }
    }

    await expect(
      insertRawFormSubmission(server, createMessage())
    ).rejects.toThrow('Database unavailable')
  })
})
