/**
 * Stores structured validation errors for later investigation and auditing.
 *
 * This helper records any failed business validation that occurs while
 * processing a CPH submission. The record is persisted in MongoDB so that
 * operators can trace which reference number failed, when it failed, and
 * which contextual data was present at the time.
 */
const validationFailuresCollection = 'cph-validation-failures'

/**
 * Logs a validation failure for a specific reference number.
 *
 * @param {object} server - The Hapi server instance, which provides the database
 *   connection and logger used for persistence and error reporting.
 * @param {string} referenceNumber - The submission reference number associated with
 *   the validation failure.
 * @param {string} failure - A non-empty human-readable description of the failure.
 * @param {object} [context] - Optional request or payload context data relevant to the error.
 * @returns {Promise<boolean>} True when the failure is recorded successfully, otherwise false.
 */
export async function logValidationFailure (server, referenceNumber, failure, context) {
  try {
    await server.db.collection(validationFailuresCollection).insertOne({
      referenceNumber,
      timestamp: new Date().toISOString(),
      failure,
      context
    })
    return true
  } catch (error) {
    server.logger.error(
      error,
      `Failed to log validation failure for ${referenceNumber}`
    )
    return false
  }
}
