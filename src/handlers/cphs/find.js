import Boom from '@hapi/boom'

const CPH_COLLECTION = 'example-data'

export function findCPHs (request, h) {
  try {
    let cphs = request.db
      .collection(CPH_COLLECTION)
      .find({}, { projection: { _id: 0 } })

    cphs = cphs.toArray()
    cphs = cphs.map((cph) => cph.cph)

    request.logger.info(`Fetched ${cphs.length} CPHs`)

    return { cphs }
  } catch (err) {
    request.logger.error('Failed to fetch CPHs', err)
    throw Boom.internal('Failed to fetch CPHs', err)
  }
}
