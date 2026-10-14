import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const client = new SQSClient(
  {
    region: 'eu-west-2',
    endpoint: 'http://localhost:4566',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
  })

await client.send(new SendMessageCommand(
  {
    QueueUrl: 'http://localhost:4566/000000000000/cph-form',
    MessageBody: JSON.stringify(
      {
        test: 'local-cph-check',
        source: `local-test ${new Date().toISOString()}`,
        meta: { referenceNumber: `ref-${new Date().toISOString()}` }
      })
  }))

console.log('Dummy message sent to local Floci queue')
