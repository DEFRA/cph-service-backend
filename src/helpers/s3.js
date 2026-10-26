import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

import { buildSqsClientConfig } from '#/plugins/sqs-consumer.js'

export function createS3Client (awsRegion) {
  return new S3Client(buildSqsClientConfig(awsRegion))
}

export async function getObjectStream (client, bucket, key) {
  const { Body } = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  )

  return Body
}

export async function getObjectBuffer (client, bucket, key) {
  const body = await getObjectStream(client, bucket, key)

  return Buffer.from(await body.transformToByteArray())
}
