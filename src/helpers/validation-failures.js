const validationFailuresCollection = 'cph-validation-failures'

export async function logValidationFailure (db, logger, referenceNumber, failure) {
  if (typeof failure !== 'string' || !failure.trim()) {
    logger.error(
      `Cannot log validation failure for ${referenceNumber}: missing failure description`
    )
    return false
  }

  try {
    await db.collection(validationFailuresCollection).insertOne({
      referenceNumber,
      timestamp: new Date().toISOString(),
      failure
    })
    return true
  } catch (error) {
    logger.error(
      error,
      `Failed to log validation failure for ${referenceNumber}`
    )
    return false
  }
}
