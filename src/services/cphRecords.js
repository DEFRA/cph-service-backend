import { validateRawSubmissionBody, validateRawSubmissionMeta } from './cph/validateRawSubmission.js'
import { createValidationFailure } from '../helpers/validation-failure.js'

async function createDraftCphRecord (rawSubmission, submissionBody, validationErrors, server) {
  const now = new Date()
  const actor = {
    identifier: 'cph-service-backend',
    name: 'CPH Service Backend'
  }

  const parsedSubmittedAt = new Date(submissionBody?.meta?.timestamp)
  const submittedAt = Number.isNaN(parsedSubmittedAt.getTime()) ? now : parsedSubmittedAt

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
      submittedAt,
    },
    createdAt: now,
    createdBy: actor,
    modifiedAt: now,
    modifiedBy: actor,
    validationErrors
  }
}

async function mapDraftCphRecord (draft, submissionBody, server) {
  const rawBodyValidationErrors = await validateRawSubmissionBody(submissionBody, server)
  draft.validationErrors.push(...rawBodyValidationErrors)

  const answers = submissionBody.data?.main
  const livestockInformation = {}

  livestockInformation.types = Array.isArray(answers.vumpmr) ? [...answers.vumpmr] : []
  livestockInformation.expectedArrivalDate = answers.yDwSNa

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
    draftCph = await mapDraftCphRecord(draftCph, submissionBody, server)
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
    server.logger.error(error, 'Failed to insert draft CPH record:')
    throw error
  }
}
