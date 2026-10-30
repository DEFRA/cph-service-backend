import Boom from '@hapi/boom'
import { findParishesByWgs84 } from '../../services/parishLookup.js'

export async function findCountyParish (request, h) {
  try {
    const { easting, northing } = request.query
    const parishes = await findParishesByWgs84(request.db, easting, northing)

    request.logger.info(`Fetched ${parishes.length} county parishes`)

    return { parishes }
  } catch (err) {
    request.logger.error(err, 'Failed to fetch county parishes')
    throw Boom.internal('Failed to fetch county parishes', err)
  }
}
