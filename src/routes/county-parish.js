import Joi from 'joi'
import { findCountyParish } from '../handlers/county-parish/find.js'

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
    handler: findCountyParish
  }
]
