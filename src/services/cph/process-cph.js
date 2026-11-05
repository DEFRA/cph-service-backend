import { generateCphNumber } from './cph-number.js'
import { CPH_STATUS } from './cph-status.js'

export async function processCphRecord (server, draftCph) {
  const { landOwned } = draftCph.livestockInformation

  if (landOwned) {
    return await permanentCphWorkflow(server, draftCph)
  }
  return draftCph
}

async function permanentCphWorkflow (server, draftCph) {
  try {
    const { locationEastingsAndNorthings } = draftCph.livestockInformation

    const { easting: locationOneEasting, northing: locationOneNorthing } = locationEastingsAndNorthings[0]

    draftCph.cphNumber = await generateCphNumber(server, locationOneEasting, locationOneNorthing)
    draftCph.lifecycleStatus = CPH_STATUS.ACTIVE
    draftCph.startDate = new Date().toISOString()

    return draftCph
  } catch (error) {
    server.logger.error(error, 'Failed to process permanent CPH workflow:')
    throw error
  }
}
