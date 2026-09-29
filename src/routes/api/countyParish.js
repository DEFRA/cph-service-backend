import Joi from 'joi'

import {
  findParishesByOsgb36,
  findParishesByWgs84
} from '../../services/parishLookup.js'

const lookups = {
  wgs84: findParishesByWgs84,
  osgb36: findParishesByOsgb36
}

export const countyParish = [
  {
    method: 'GET',
    path: '/api/countyparish',
    options: {
      validate: {
        query: Joi.object({
          easting: Joi.number().required(),
          northing: Joi.number().required(),
          projection: Joi.string()
            .valid(...Object.keys(lookups))
            .default('wgs84')
        })
      }
    },
    handler: async (request, h) => {
      const { easting, northing, projection } = request.query
      const parishes = await lookups[projection](request.db, easting, northing)

      return h.response({ parishes })
    }
  }
]
