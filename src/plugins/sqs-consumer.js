import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand
} from '@aws-sdk/client-sqs'

import { insertRawFormSubmission } from '../services/rawFormSubmissions.js'
const waitTimeSeconds = 20
const maxNumberOfMessages = 10

export function buildSqsClientConfig (awsRegion) {
  const endpoint = process.env.AWS_ENDPOINT_URL
  const isLocalEndpoint = Boolean(endpoint)
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? (isLocalEndpoint ? 'test' : undefined)
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? (isLocalEndpoint ? 'test' : undefined)

  return {
    region: awsRegion,
    ...(isLocalEndpoint ? { endpoint, forcePathStyle: true } : {}),
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey
          }
        }
      : {})
  }
}

export const consumer = {
  plugin: {
    name: 'sqs-consumer',
    version: '1.0.0',
    register: async function (server, options) {
      const { queueUrl, awsRegion } = options

      if (!queueUrl) {
        server.logger.info('No SQS queue url configured, skipping consumer')
        return
      }

      const client = new SQSClient(buildSqsClientConfig(awsRegion))
      let polling = true

      server.logger.info(`Listening to SQS queue ${queueUrl}`)

      const pollPromise = pollQueue(
        client,
        queueUrl,
        server.db,
        server.logger,
        () => polling
      )

      server.events.on('stop', async () => {
        server.logger.info('Stopping SQS consumer')
        polling = false
        await pollPromise
        client.destroy()
      })
    }
  }
}

async function pollQueue (client, queueUrl, db, logger, isPolling) {
  while (isPolling()) {
    const { Messages } = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        WaitTimeSeconds: waitTimeSeconds
      })
    )

    if (Messages?.length > 0) {
      logger.info(`Received ${Messages?.length ?? 0} messages from SQS`)
    }

    for (const message of Messages ?? []) {
      await processMessage(client, queueUrl, db, logger, message)
    }
  }
}

export async function processMessage (
  client,
  queueUrl,
  db,
  logger,
  message
) {
  try {
    await insertRawFormSubmission(db, message.Body)
  } catch (error) {
    logger.error(
      error,
      `Failed to store SQS message ${message.MessageId}; message not deleted`
    )
    return
  }

  logger.info(`Stored SQS message ${message.MessageId} `)

  try {
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
      })
    )
  } catch (error) {
    logger.error(
      error,
      `Failed to delete SQS message ${message.MessageId}`
    )
  }
}
