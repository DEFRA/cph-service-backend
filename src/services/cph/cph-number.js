import Joi from 'joi'

export async function generateCphNumber (server, easting, northing) {
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
    const nextHoldingNumber = await getNextHoldingNumber(server, cpNumber)
    const cphNumber = `${cpNumber}/${String(nextHoldingNumber).padStart(4, '0')}`

    return cphNumber
  } catch (error) {
    console.error('Failed to generate CPH number:', error)
    throw error
  }
}

async function getNextHoldingNumber (server, cpNumber) {
  await server.db.collection('cph-sequences').updateOne(
    { cpNumber },
    { $inc: { sequence: 1 } },
    { upsert: true }
  )

  const sequenceDoc = await server.db.collection('cph-sequences').findOne({ cpNumber })

  return sequenceDoc?.sequence || 1
}
