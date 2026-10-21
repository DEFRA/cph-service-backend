const collectionName = 'raw-form-submissions'

export function insertRawFormSubmission (server, body) {
  const submission = JSON.parse(body)
  const referenceNumber = submission?.meta?.referenceNumber

  if (typeof referenceNumber !== 'string' || !referenceNumber.trim()) {
    throw new Error('Form submission is missing meta.referenceNumber')
  }

  return server.db.collection(collectionName).updateOne(
    { referenceNumber },
    {
      $setOnInsert: {
        referenceNumber,
        formId: submission.meta.formId,
        receivedAt: new Date(),
        body
      }
    },
    { upsert: true }
  )
}
