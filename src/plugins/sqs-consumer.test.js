import { DeleteMessageCommand } from '@aws-sdk/client-sqs'
import { processMessage } from './sqs-consumer.js'
import { describe, expect, test, vi } from 'vitest'

const queueUrl = 'http://localhost:4566/000000000000/test-queue'

function createBody() {
    return JSON.stringify({
        meta: {
            referenceNumber: 'TEST-REF-001',
            formId: 'test-form-id'
        },
        data: {
            main: {
                inventedAnswer: 'test value'
            }
        }
    })
}

function createMessage(body = createBody()) {
    return {
        MessageId: 'test-message-id',
        ReceiptHandle: 'test-receipt-handle',
        Body: body
    }
}

function createLogger() {
    return {
        info: vi.fn(),
        error: vi.fn()
    }
}

function createDb(updateOne = vi.fn().mockResolvedValue({ upsertedCount: 1 })) {
    return {
        collection: vi.fn().mockReturnValue({ updateOne })
    }
}

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
        const message = createMessage( '{invalid}')

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
})
