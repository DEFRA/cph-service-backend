import { validateRawSubmissionBody } from './validateRawSubmission.js'

export function mapLocations (locationEastingsAndNorthings) {
  const mappedLocations = locationEastingsAndNorthings.map(item => {
    const { easting, northing } = item.UOmNur
    return { easting, northing }
  })
  return mappedLocations
}

export async function mapDraftCphRecord (draft, submissionBody, server) {
  const rawBodyValidationErrors = await validateRawSubmissionBody(submissionBody, server)
  draft.validationErrors.push(...rawBodyValidationErrors)

  const answers = submissionBody.data?.main
  const repeaters = submissionBody.data?.repeaters

  // Create form answer keys: docs/create-cph-form-field-mapping.md
  const {
    vumpmr: livestockTypes,
    yDwSNa: expectedArrivalDate,
    rOgnUv: landOwned
  } = answers

  const {
    hNCJCl: locationEastingsAndNorthings
  } = repeaters

  const livestockInformation = {}

  livestockInformation.types = Array.isArray(livestockTypes) ? [...livestockTypes] : []
  livestockInformation.expectedArrivalDate = expectedArrivalDate
  livestockInformation.landOwned = landOwned
  livestockInformation.locationEastingsAndNorthings = mapLocations(locationEastingsAndNorthings)

  return {
    ...draft,
    livestockInformation
  }
}
