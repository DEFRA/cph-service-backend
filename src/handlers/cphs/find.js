import Boom from '@hapi/boom'

const CPH_COLLECTION = 'cphs'

export async function findCphs (request, h) {
  try {
    let cphs = await request.db
      .collection(CPH_COLLECTION)
      .find({}, { projection: { _id: 0 } })

    cphs = await cphs.toArray()
    cphs = cphs.map((cph) => cph.cph)

    request.logger.info(`Fetched ${cphs.length} CPHs`)

    return { cphs }
  } catch (err) {
    request.logger.error(err, 'Failed to fetch CPHs')
    throw Boom.internal('Failed to fetch CPHs', err)
  }
}
