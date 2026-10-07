import Boom from '@hapi/boom'

const CPH_COLLECTION = 'example-data'

export async function deleteCphs (request, h) {
  try {
    const result = await request.db.collection(CPH_COLLECTION).deleteMany({})

    request.logger.info(`Deleted ${result.deletedCount} CPHs`)

    return h.response().code(204)
  } catch (err) {
    request.logger.error('Failed to delete CPHs', err)
    throw Boom.internal('Failed to delete CPHs', err)
  }
}
