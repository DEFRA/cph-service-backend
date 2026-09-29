import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'

import { MAP_DATA_COLLECTION, repairRingOrder } from '#/services/mapData.js'
import { osgb36ToWgs84 } from '#/common/helpers/osgb36.js'

const PROJECTION = { _id: 0, name: 1, countyRef: 1, parishRef: 1 }

// Parishes can legitimately overlap, so both lookups return every match. Sorted
// by _id only to keep the order stable across index rebuilds and reloads.
const SORT = { _id: 1 }

/**
 * Finds the parishes containing an OSGB36 easting/northing by reprojecting the
 * point to WGS84 and querying the 2dsphere-indexed geometry.
 */
export function findParishesByWgs84(db, easting, northing) {
  const [longitude, latitude] = osgb36ToWgs84([easting, northing])

  return db
    .collection(MAP_DATA_COLLECTION)
    .find(
      {
        geometry: {
          $geoIntersects: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] }
          }
        }
      },
      { projection: PROJECTION, sort: SORT }
    )
    .toArray()
}

/**
 * Finds the same parishes from the unprojected geometryOsgb36. MongoDB has no
 * geospatial index for a projected CRS, so this narrows candidates on the
 * indexed bounding box and then tests containment here.
 */
export async function findParishesByOsgb36(db, easting, northing) {
  const candidates = db.collection(MAP_DATA_COLLECTION).find(
    {
      'bboxOsgb36.minE': { $lte: easting },
      'bboxOsgb36.maxE': { $gte: easting },
      'bboxOsgb36.minN': { $lte: northing },
      'bboxOsgb36.maxN': { $gte: northing }
    },
    { projection: { ...PROJECTION, geometryOsgb36: 1 }, sort: SORT }
  )

  const matches = []

  for await (const candidate of candidates) {
    // Turf is planar, so it reads OSGB36 metres directly. The stored geometry is
    // unmodified source, so its rings need ordering before they mean anything.
    const geometry = repairRingOrder(candidate.geometryOsgb36)

    if (booleanPointInPolygon([easting, northing], geometry)) {
      matches.push({
        name: candidate.name,
        countyRef: candidate.countyRef,
        parishRef: candidate.parishRef
      })
    }
  }

  return matches
}
