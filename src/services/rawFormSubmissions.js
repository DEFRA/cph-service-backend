const collectionName = 'raw-form-submissions'

export async function insertRawFormSubmission (server, message) {
  try {
    await server.db.collection(collectionName).updateOne(
      { messageId: message.MessageId },
      {
        $setOnInsert: {
          messageId: message.MessageId,
          receivedAt: new Date(),
          body: message.Body
        }
      },
      { upsert: true }
    )

    return await server.db.collection(collectionName).findOne({ messageId: message.MessageId })
  } catch (error) {
    server.logger.error(error, 'Failed to insert raw form submission')
    throw error
  }
}
