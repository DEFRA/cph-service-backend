import Boom from '@hapi/boom'

const CPH_COLLECTION = 'example-data'

export async function createCPH (request, h) {
  try {
    const { insertedId } = await request.db.collection(CPH_COLLECTION).insertOne(request.payload)

    request.logger.info(`Inserted CPH with ID: ${insertedId}`)

    return h
      .response()
      .code(201)
      .header('Location', `/api/cphs/${insertedId}`)
  } catch (err) {
    request.logger.error('Error inserting CPH', err)
    throw Boom.internal('Error inserting CPH', err)
  }
}
