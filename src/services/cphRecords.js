export function mapDraftCphRecord (rawSubmission) {
  const submission = JSON.parse(rawSubmission.body)
  const meta = submission.meta
  const submittedAt = new Date(meta.timestamp)
  if (
    typeof meta.timestamp !== 'string' || meta.timestamp.trim() === '' ||
    Number.isNaN(submittedAt.getTime())
  ) {
    throw new Error('Missing or invalid submission timestamp')
  }

  const answers = submission.data?.main ?? {}

  // Create form answer keys: docs/create-cph-form-field-mapping.md
  const {
    vumpmr: livestockTypes,
    yDwSNa: expectedArrivalDate
  } = answers

  const livestockInformation = {}

  if (livestockTypes !== undefined) {
    livestockInformation.types = [...livestockTypes]
  }

  if (expectedArrivalDate !== undefined) {
    const { day, month, year } = expectedArrivalDate
    livestockInformation.expectedArrivalDate = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }
  return {
    lifecycleStatus: 'Draft',
    source: {
      rawSubmissionId: rawSubmission._id,
      applicationReference: meta.referenceNumber,
      formId: meta.formId,
      formVersion: meta.versionMetadata?.versionNumber,
      submittedAt,
      receivedAt: rawSubmission.receivedAt
    },
    livestockInformation
  }
}

export function insertDraftCphRecord (db, rawSubmission) {
  const draft = mapDraftCphRecord(rawSubmission)
  const now = new Date()
  const actor = {
    identifier: 'cph-service-backend',
    name: 'CPH Service Backend'
  }

  return db.collection('cph-records').updateOne(
    { 'source.rawSubmissionId': rawSubmission._id },
    {
      $setOnInsert: {
        ...draft,
        createdAt: now,
        createdBy: actor,
        modifiedAt: now,
        modifiedBy: actor
      }
    },
    { upsert: true }
  )
}
