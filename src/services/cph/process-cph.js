import { generateCphNumber } from './cph-number.js'
import { CPH_STATUS, CPH_HOLDING_TYPES } from './cph-parameters.js'

export async function processCphRecord (server, draftCph) {
  const { landOwned, tenancyAgreementMoreThanOneYear, landownerHasCphNumber } = draftCph.livestockInformation

  if (landOwned) {
    return await permanentCphWorkflow(server, draftCph, CPH_HOLDING_TYPES.PERMANENT)
  }

  if (tenancyAgreementMoreThanOneYear && !landownerHasCphNumber) {
    return await permanentCphWorkflow(server, draftCph, CPH_HOLDING_TYPES.PERMANENT)
  }

  return draftCph
}

async function permanentCphWorkflow (server, draftCph, holdingType) {
  try {
    const { locationEastingsAndNorthings } = draftCph.livestockInformation

    const { easting: locationOneEasting, northing: locationOneNorthing } = locationEastingsAndNorthings[0]

    draftCph.cphNumber = await generateCphNumber(server, locationOneEasting, locationOneNorthing, holdingType)
    draftCph.lifecycleStatus = CPH_STATUS.ACTIVE
    draftCph.startDate = new Date().toISOString()

    return draftCph
  } catch (error) {
    server.logger.error(error, 'Failed to process permanent CPH workflow:')
    throw error
  }
}
