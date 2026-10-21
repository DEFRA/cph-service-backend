import Joi from 'joi'

import { createValidationFailure } from '../../helpers/validation-failure.js'
import { logValidationFailure } from '../../helpers/validation-failures.js'

const dateParts = Joi.object({
  year: Joi.number().integer().min(2020).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  day: Joi.number().integer().min(1).max(31).required()
}).custom((value, helpers) => {
  const { year, month, day } = value
  const date = new Date(Date.UTC(year, month - 1, day))

  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  if (!valid) {
    return helpers.error('date.invalid')
  }

  return value
}).messages({
  'date.invalid': '{{#label}} must be a real date'
})

const rawBodySchema = Joi.object({
  data: Joi.object({
    main: Joi.object({
      yDwSNa: dateParts.required(),
      vumpmr: Joi.array().min(1).items(Joi.string()).required()
    }).required().unknown(true)
  }).required().unknown(true)
}).unknown(true)

export async function validateRawSubmissionBody (submission, server) {
  const validationErrors = []

  try {
    Joi.assert(submission, rawBodySchema, { abortEarly: false })
  } catch (error) {
    server.logger.error(error, 'Validation failed for raw submission body')

    error.details.forEach(details => validationErrors.push(
      createValidationFailure(details.message, details.context)
    ))
  }

  return validationErrors
}

const rawMetaSchema = Joi.object({
  meta: Joi.object({
    referenceNumber: Joi.string().required(),
    formId: Joi.string().required(),
    versionMetadata: Joi.object({
      versionNumber: Joi.number().strict().required()
    }).required().unknown(true),
    timestamp: Joi.string().isoDate().required()
  }).required().unknown(true)
}).unknown(true)

export async function validateRawSubmissionMeta (submission, server) {
  const validationErrors = []

  try {
    Joi.assert(submission, rawMetaSchema, { abortEarly: false })
  } catch (error) {
    server.logger.error(error, 'Validation failed for raw submission meta')

    error.details.forEach(details => validationErrors.push(
      createValidationFailure(details.message, details.context)
    ))
  }

  return validationErrors
}

export async function validateRawSubmission (submission, server) {
  try {
    return Joi.attempt(submission, Joi.object({
      meta: rawMetaSchema.extract('meta'),
      data: rawBodySchema.extract('data')
    }).required().unknown(true), { abortEarly: false })
  } catch (error) {
    const referenceNumber = submission?.meta?.referenceNumber

    if (server && referenceNumber) {
      await Promise.all((error.details ?? [{ message: error.message, context: {} }]).map(details =>
        logValidationFailure(server, referenceNumber, details.message, details.context)
      ))
    }

    throw error
  }
}
