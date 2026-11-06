import { validateRawSubmissionMeta } from './validateRawSubmission.js'
import { createValidationFailure } from '../../helpers/validation-failure.js'
import { processCphRecord } from './process-cph.js'
import { mapDraftCphRecord } from './cph-mapping.js'
import { CPH_STATUS } from './cph-parameters.js'

async function createDraftCphRecord (rawSubmission, submissionBody, validationErrors, server) {
  const now = new Date()
  const actor = {
    identifier: 'cph-service-backend',
    name: 'CPH Service Backend'
  }

  const timestamp = submissionBody?.meta?.timestamp
  const parsedSubmittedAt = typeof timestamp === 'string' ? new Date(timestamp) : new Date(NaN)
  const submittedAt = Number.isNaN(parsedSubmittedAt.getTime()) ? now : parsedSubmittedAt

  const rawMetaValidationErrors = await validateRawSubmissionMeta(submissionBody, server)
  validationErrors.push(...rawMetaValidationErrors)

  return {
    cphNumber: '',
    lifecycleStatus: CPH_STATUS.DRAFT,
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

  if (draftCph.lifecycleStatus !== CPH_STATUS.MANUAL_REVIEW) {
    try {
      draftCph = await processCphRecord(server, draftCph)
    } catch (error) {
      server.logger.error(error, 'Failed to process CPH record:')
      draftCph.validationErrors.push(createValidationFailure('Failed to process CPH record:', { message: error.message }))
      draftCph.lifecycleStatus = CPH_STATUS.MANUAL_REVIEW
    }
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
