import { createValidationFailure } from '../helpers/validation-failure.js'
import { validateRawSubmissionBody, validateRawSubmissionMeta } from './cph/validateRawSubmission.js'

export function mapDraftCphRecord (rawSubmission, submission) {
  const meta = submission.meta ?? {}
  const submittedAt = meta.timestamp ? new Date(meta.timestamp) : new Date()
  const answers = submission.data?.main ?? {}

  const livestockInformation = {}

  if (answers.vumpmr !== undefined) {
    livestockInformation.types = [...answers.vumpmr]
  }

  if (answers.yDwSNa !== undefined) {
    const { day, month, year } = answers.yDwSNa
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

async function createDraftCphRecord (rawSubmission, submissionBody, validationErrors, server) {
  const now = new Date()
  const submittedAt = new Date(submissionBody?.meta?.timestamp ?? now)
  const parsedSubmittedAt = Number.isNaN(submittedAt.getTime()) ? now : submittedAt

  const rawMetaValidationErrors = await validateRawSubmissionMeta(submissionBody, server)
  validationErrors.push(...rawMetaValidationErrors)

  return {
    lifecycleStatus: 'Draft',
    source: {
      rawSubmissionId: rawSubmission?._id,
      receivedAt: rawSubmission?.receivedAt,
      applicationReference: submissionBody?.meta?.referenceNumber ?? 'Unknown',
      formId: submissionBody?.meta?.formId ?? 'Unknown',
      formVersion: submissionBody?.meta?.versionMetadata?.versionNumber ?? 'Unknown',
      submittedAt: parsedSubmittedAt,
    },
    createdAt: now,
    createdBy: {
      identifier: 'cph-service-backend',
      name: 'CPH Service Backend'
    },
    modifiedAt: now,
    modifiedBy: {
      identifier: 'cph-service-backend',
      name: 'CPH Service Backend'
    },
    validationErrors
  }
}

async function enrichDraftCphRecord (draft, submissionBody, server) {
  const rawBodyValidationErrors = await validateRawSubmissionBody(submissionBody, server)
  draft.validationErrors.push(...rawBodyValidationErrors)

  const answers = submissionBody.data?.main ?? {}
  const livestockInformation = {}

  if (answers.vumpmr !== undefined) {
    livestockInformation.types = Array.isArray(answers.vumpmr) ? [...answers.vumpmr] : []
  }

  if (answers.yDwSNa !== undefined) {
    livestockInformation.expectedArrivalDate = answers.yDwSNa
  }

  return {
    ...draft,
    livestockInformation
  }
}

export async function insertDraftCphRecord (server, rawSubmission) {
  let draftCph = {}
  let submissionBody = {}
  const validationErrors = []
  let failedToParseBody = false

  try {
    submissionBody = JSON.parse(rawSubmission.body)
  } catch (error) {
    failedToParseBody = true
    validationErrors.push(createValidationFailure('Failed to parse raw submission body', rawSubmission.body))
  }

  draftCph = await createDraftCphRecord(rawSubmission, submissionBody, validationErrors, server)

  if (!failedToParseBody) {
    draftCph = await enrichDraftCphRecord(draftCph, submissionBody, server)
  }

  try {
    await server.db.collection('cph-records').updateOne(
      { 'source.rawSubmissionId': rawSubmission._id },
      {
        $setOnInsert: {
          ...draftCph
        }
      },
      { upsert: true }
    )
  } catch (error) {
    server.logger.error(error, 'Failed to insert draft CPH record')
    throw error
  }
}
