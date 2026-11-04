import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export function buildAwsConfig (awsRegion) {
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

export function createS3Client (awsRegion) {
  return new S3Client(buildAwsConfig(awsRegion))
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
