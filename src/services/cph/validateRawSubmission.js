import Joi from 'joi'
import { createValidationFailure } from '../../helpers/validation-failure.js'

// const MS_PER_DAY = 24 * 60 * 60 * 1000
// const MAX_DAYS_FROM_TODAY = 7

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

  // const now = new Date()
  // const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  // const diffDays = (date.getTime() - today) / MS_PER_DAY

  // return diffDays >= 0 && diffDays <= MAX_DAYS_FROM_TODAY ? value : helpers.error('date.outOfRange')
}).messages({
  'date.invalid': '{{#label}} must be a real date'
  // 'date.outOfRange': `{{#label}} must be today or within the next ${MAX_DAYS_FROM_TODAY} days`
})

const rawBodySchema = Joi.object({
  data: Joi.object({
    main: Joi.object({
      yDwSNa: dateParts.required(), // What date will the livestock arrive?
      vumpmr: Joi.array().min(1).items(Joi.string()).required(), // What livestock will you keep?
      rOgnUv: Joi.boolean().strict().required(), // Do you own the land?
      qLmGSL: Joi.boolean().strict().when('rOgnUv', { is: false, then: Joi.required(), otherwise: Joi.optional() }), // Is your tenancy agreement for more than one year?
      uuQMUp: Joi.boolean().strict().when('rOgnUv', { is: false, then: Joi.required(), otherwise: Joi.optional() }) // Does the landowner have a CPH number for the land?
    }).required().unknown(true),
    repeaters: Joi.object({
      hNCJCl: Joi.array().items( // Eastings and northings for the area where you'll keep livestock
        Joi.object({
          UOmNur: Joi.object({
            easting: Joi.number().strict().required(),
            northing: Joi.number().strict().required()
          }).required()
        }).required()
      ).required()
    }).required().unknown(true), // Repeaters section
  }).required().unknown(true),
}).unknown(true)

export async function validateRawSubmissionBody (submission, server) {
  const validationErrors = []

  try {
    Joi.assert(submission, rawBodySchema, { abortEarly: false })
  } catch (error) {
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
    error.details.forEach(details => validationErrors.push(
      createValidationFailure(details.message, details.context)
    ))
  }

  return validationErrors
}
