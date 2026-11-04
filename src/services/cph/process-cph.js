import { generateCphNumber } from './cph-number.js'
import { createValidationFailure } from '../../helpers/validation-failure.js'

export async function processCphRecord (server, draftCph) {
  try {
    const { landOwned } = draftCph.livestockInformation

    if (landOwned) {
      return await permanentCphWorkflow(server, draftCph)
    }
    return draftCph
  } catch (error) {
    server.logger.error(error, 'Failed to process CPH record:')
    draftCph.validationFailures.push(createValidationFailure('Failed to process CPH record:', error))
    draftCph.lifecycleStatus = 'Manual Review'
    throw error
  }
}

async function permanentCphWorkflow (server, draftCph) {
  try {
    const { locationEastingsAndNorthings } = draftCph.livestockInformation

    const { easting: locationOneEasting, northing: locationOneNorthing } = locationEastingsAndNorthings[0]

    draftCph.cphNumber = await generateCphNumber(server, locationOneEasting, locationOneNorthing)
    draftCph.lifecycleStatus = 'Active'
    draftCph.startDate = new Date().toISOString()

    return draftCph
  } catch (error) {
    server.logger.error(error, 'Failed to process permanent CPH workflow:')
    throw error
  }
}
