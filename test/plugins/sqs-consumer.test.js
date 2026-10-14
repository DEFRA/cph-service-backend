import { DeleteMessageCommand } from '@aws-sdk/client-sqs'
import {
  processMessage,
  buildSqsClientConfig
} from '../../src/plugins/sqs-consumer.js'
import { describe, expect, test, vi } from 'vitest'

const queueUrl = 'http://localhost:4566/000000000000/test-queue'

function createBody () {
  return JSON.stringify({
    meta: {
      referenceNumber: 'TEST-REF-001',
      formId: 'test-form-id',
      timestamp: '2026-10-08T08:39:38.073Z'
    },
    data: {
      main: {
        inventedAnswer: 'test value'
      }
    }
  })
}

function createMessage (body = createBody()) {
  return {
    MessageId: 'test-message-id',
    ReceiptHandle: 'test-receipt-handle',
    Body: body
  }
}

function createLogger () {
  return {
    info: vi.fn(),
    error: vi.fn()
  }
}

function createDb (
  updateOne = vi.fn().mockResolvedValue({ upsertedCount: 1 })
) {
  const rawSubmission = {
    _id: 'test-raw-submission-id',
    receivedAt: new Date('2026-10-08T08:39:38.363Z'),
    body: createBody()
  }

  const rawCollection = {
    updateOne,
    findOne: vi.fn().mockResolvedValue(rawSubmission)
  }

  const draftCollection = {
    updateOne: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
    findOne: vi.fn().mockResolvedValue({ upsertedCount: 1 })
  }

  return {
    rawCollection,
    draftCollection,
    collection: vi.fn((name) => {
      if (name === 'raw-form-submissions') return rawCollection
      if (name === 'cph-records') return draftCollection
      throw new Error(`Unknown collection name: ${name}`)
    })
  }
}

describe('#buildSqsClientConfig', () => {
  test('uses local AWS endpoint and credentials when configured', () => {
    const originalEndpoint = process.env.AWS_ENDPOINT_URL
    const originalAccessKeyId = process.env.AWS_ACCESS_KEY_ID
    const originalSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    process.env.AWS_ENDPOINT_URL = 'http://localhost:4566'
    process.env.AWS_ACCESS_KEY_ID = 'test'
    process.env.AWS_SECRET_ACCESS_KEY = 'test'

    try {
      expect(buildSqsClientConfig('eu-west-2')).toMatchObject({
        region: 'eu-west-2',
        endpoint: 'http://localhost:4566',
        forcePathStyle: true,
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test'
        }
      })
    } finally {
      if (originalEndpoint === undefined) delete process.env.AWS_ENDPOINT_URL
      else process.env.AWS_ENDPOINT_URL = originalEndpoint

      if (originalAccessKeyId === undefined) delete process.env.AWS_ACCESS_KEY_ID
      else process.env.AWS_ACCESS_KEY_ID = originalAccessKeyId

      if (originalSecretAccessKey === undefined) delete process.env.AWS_SECRET_ACCESS_KEY
      else process.env.AWS_SECRET_ACCESS_KEY = originalSecretAccessKey
    }
  })
})

describe('#processMessage', () => {
  test('Deletes the SQS message after successful storage', async () => {
    const send = vi.fn().mockResolvedValue({})
    const client = { send }
    const db = createDb()
    const logger = createLogger()
    const message = createMessage()

    await processMessage(client, queueUrl, db, logger, message)

    expect(send).toHaveBeenCalledTimes(1)

    const deleteCommand = send.mock.calls[0][0]

    expect(deleteCommand).toBeInstanceOf(DeleteMessageCommand)
    expect(deleteCommand.input).toEqual({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
    })
  })

  test('Does not delete the SQS message when storage fails', async () => {
    const databaseError = new Error('Database unavailable')
    const updateOne = vi.fn().mockRejectedValue(databaseError)
    const client = { send: vi.fn() }
    const db = createDb(updateOne)
    const logger = createLogger()
    const message = createMessage()

    await processMessage(client, queueUrl, db, logger, message)

    expect(client.send).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(
      databaseError,
      'Failed to store SQS message test-message-id; message not deleted'
    )
  })

  test('Does not delete a malformed SQS message', async () => {
    const client = { send: vi.fn() }
    const db = createDb()
    const logger = createLogger()
    const message = createMessage('{invalid}')

    await processMessage(client, queueUrl, db, logger, message)

    expect(client.send).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  test('Logs an SQS deletion failure after successful storage', async () => {
    const deletionError = new Error('SQS unavailable')
    const client = {
      send: vi.fn().mockRejectedValue(deletionError)
    }
    const db = createDb()
    const logger = createLogger()
    const message = createMessage()

    await processMessage(client, queueUrl, db, logger, message)

    expect(logger.error).toHaveBeenCalledWith(
      deletionError,
      'Failed to delete SQS message test-message-id'
    )
  })

  test('stores the Draft using the retained raw submission', async () => {
    const client = { send: vi.fn().mockResolvedValue({}) }
    const db = createDb()
    const logger = createLogger()

    const retained = JSON.parse(createBody())
    retained.data.main.vumpmr = ['Cattle']

    db.rawCollection.findOne.mockResolvedValue({
      _id: 'test-raw-submission-id',
      receivedAt: new Date('2026-10-08T08:39:38:363Z'),
      body: JSON.stringify(retained)
    })

    const incoming = JSON.parse(createBody())
    incoming.data.main.vumpmr = ['Sheep']

    await processMessage(
      client,
      queueUrl,
      db,
      logger,
      createMessage(JSON.stringify(incoming))
    )

    expect(db.rawCollection.findOne).toHaveBeenCalledWith({
      referenceNumber: 'TEST-REF-001'
    })

    expect(db.draftCollection.updateOne).toHaveBeenCalledWith(
      { 'source.rawSubmissionId': 'test-raw-submission-id' },
      {
        $setOnInsert: expect.objectContaining({
          lifecycleStatus: 'Draft',
          livestockInformation: {
            types: ['Cattle']
          }
        })
      },
      { upsert: true }
    )

    expect(client.send).toHaveBeenCalledTimes(1)
  })

  test('does not delete the message when Draft storage fails', async () => {
    const storageError = new Error('Draft storage unavailable')
    const client = { send: vi.fn().mockResolvedValue({}) }
    const db = createDb()
    const logger = createLogger()

    db.draftCollection.updateOne.mockRejectedValue(storageError)

    await processMessage(
      client,
      queueUrl,
      db,
      logger,
      createMessage()
    )

    expect(db.rawCollection.updateOne).toHaveBeenCalledTimes(1)
    expect(db.draftCollection.updateOne).toHaveBeenCalledTimes(1)
    expect(client.send).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(
      storageError,
      'Failed to store SQS message test-message-id; message not deleted'
    )
  })
})
