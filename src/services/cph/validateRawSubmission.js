import Joi from 'joi'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MAX_DAYS_FROM_TODAY = 7

const dateParts = Joi.object({
  year: Joi.number().integer().min(1900).max(2100).required(),
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

  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = (date.getTime() - today) / MS_PER_DAY

  return diffDays >= 0 && diffDays <= MAX_DAYS_FROM_TODAY ? value : helpers.error('date.outOfRange')
}).messages({
  'date.invalid': '{{#label}} must be a real date',
  'date.outOfRange': `{{#label}} must be today or within the next ${MAX_DAYS_FROM_TODAY} days`
})

const rawFormSchema = Joi.object({
  data: Joi.object({
    main: Joi.object({
      yDwSNa: dateParts
    }).required()
  }).required(),
  meta: Joi.object({
    timestamp: Joi.string().required()
  }).required().unknown(true)
}).unknown(true)

export function validateRawSubmission (submission) {
  try {
    Joi.assert(submission, rawFormSchema, { abortEarly: false })
  } catch (error) {
    error.details.forEach(details => {
      console.error(`Validation Error: ${JSON.stringify(details.message)} - Context: ${JSON.stringify(details.context)}`)
    })

    throw new Error(`Invalid submission: ${error.message}`)
  }
}
