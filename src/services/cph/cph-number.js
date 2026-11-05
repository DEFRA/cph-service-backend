import Joi from 'joi'
import { CPH_RANGES } from './cph-parameters.js'

export async function generateCphNumber (server, easting, northing, holdingType) {
  try {
    const parishInfo = await server.findParishesByWgs84(server.db, easting, northing)

    if (!parishInfo || parishInfo.length === 0) {
      throw new Error('No parish information found for the given coordinates')
    }

    const parishSchema = Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        countyRef: Joi.number().required(),
        parishRef: Joi.number().required()
      }).min(1)
    )

    try {
      Joi.assert(parishInfo, parishSchema)
    } catch (error) {
      throw new Error('Parish information validation failed: ' + error.message)
    }

    const { countyRef, parishRef } = parishInfo[0]

    const cpNumber = `${String(countyRef).padStart(2, '0')}/${String(parishRef).padStart(3, '0')}`
    const nextHoldingNumber = await getNextHoldingNumber(server, cpNumber, holdingType)
    const cphNumber = `${cpNumber}/${String(nextHoldingNumber).padStart(4, '0')}`

    return cphNumber
  } catch (error) {
    console.error('Failed to generate CPH number:', error)
    throw error
  }
}

async function getNextHoldingNumber (server, cpNumber, holdingType) {
  const holdingRange = CPH_RANGES[holdingType]

  const sequenceDoc = await server.db.collection('cph-sequences').findOneAndUpdate(
    { cpNumber, holdingType },
    [
      {
        $set: {
          sequence: {
            $cond: [
              { $eq: [{ $ifNull: ['$sequence', null] }, null] },
              holdingRange.MIN,
              { $add: ['$sequence', 1] }
            ]
          }
        }
      }
    ],
    {
      upsert: true,
      returnDocument: 'after'
    }
  )

  if (sequenceDoc.sequence > holdingRange.MAX) {
    throw new Error(`Holding number exceeds the maximum allowed value for holding type ${holdingType} of ${holdingRange.MAX}`)
  }

  return sequenceDoc.sequence
}
