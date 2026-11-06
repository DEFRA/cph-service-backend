import Joi from 'joi'
import { CPH_RANGES } from './cph-parameters.js'

const DUPLICATE_KEY_ERROR_CODE = 11000
const MAX_UPSERT_ATTEMPTS = 3

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
    server.logger.error('Failed to generate CPH number:', error)
    throw error
  }
}

async function getNextHoldingNumber (server, cpNumber, holdingType) {
  const holdingRange = CPH_RANGES[holdingType]
  const sequenceDoc = await incrementSequence(server, cpNumber, holdingType, holdingRange)

  if (sequenceDoc.sequence > holdingRange.MAX) {
    throw new Error(`Holding number exceeds the maximum allowed value for holding type ${holdingType} of ${holdingRange.MAX}`)
  }

  return sequenceDoc.sequence
}

async function incrementSequence (server, cpNumber, holdingType, holdingRange, attempt = 1) {
  try {
    return await upsertSequence(server, cpNumber, holdingType, holdingRange)
  } catch (error) {
    // Concurrent upserts on a new key race to insert; the loser hits the unique index and can safely retry as an update
    if (error?.code === DUPLICATE_KEY_ERROR_CODE && attempt < MAX_UPSERT_ATTEMPTS) {
      return incrementSequence(server, cpNumber, holdingType, holdingRange, attempt + 1)
    }
    throw new Error('Failed to increment holding number sequence: ' + error.message)
  }
}

function upsertSequence (server, cpNumber, holdingType, holdingRange) {
  return server.db.collection('cph-sequences').findOneAndUpdate(
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
}
