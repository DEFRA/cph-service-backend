import { MAP_DATA_COLLECTION } from '#/services/mapData.js'
import { osgb36ToWgs84 } from '#/common/helpers/osgb36.js'

const PROJECTION = { _id: 0, name: 1, countyRef: 1, parishRef: 1 }

// Parishes can legitimately overlap, so the lookup returns every match. Sorted
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
