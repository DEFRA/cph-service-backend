import Joi from 'joi'

import { findParishesByWgs84 } from '../../services/parishLookup.js'

export const countyParish = [
  {
    method: 'GET',
    path: '/api/countyparish',
    options: {
      validate: {
        query: Joi.object({
          easting: Joi.number().required(),
          northing: Joi.number().required()
        })
      }
    },
    handler: async (request, h) => {
      const { easting, northing } = request.query
      const parishes = await findParishesByWgs84(request.db, easting, northing)

      return h.response({ parishes })
    }
  }
]
