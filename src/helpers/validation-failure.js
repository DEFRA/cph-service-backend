export function createValidationFailure (message, context) {
  return {
    timestamp: new Date().toISOString(),
    failure: message,
    context
  }
}
