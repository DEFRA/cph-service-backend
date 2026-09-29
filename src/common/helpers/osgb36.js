import { readFileSync } from 'node:fs'

import proj4 from 'proj4'

const OSGB36 = 'EPSG:27700'
const WGS84 = 'EPSG:4326'
const NADGRID = 'OSTN15_NTv2_OSGBtoETRS'

let converter

export function initOsgb36ToWgs84(gridFilePath) {
  const oSTN15 = readFileSync(gridFilePath).buffer

  proj4.nadgrid(NADGRID, oSTN15)
  proj4.defs(
    OSGB36,
    `+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +units=m +no_defs +nadgrids=${NADGRID}`
  )

  converter = proj4(OSGB36, WGS84)
}

export function osgb36ToWgs84(point) {
  if (!converter) {
    throw new Error('initOsgb36ToWgs84 must be called before converting points')
  }

  return converter.forward(point)
}

/**
 * Walks a GeoJSON coordinates array of any nesting depth, converting each
 * [easting, northing] pair to [longitude, latitude].
 */
export function convertCoordinates(coordinates) {
  if (typeof coordinates[0] === 'number') {
    return osgb36ToWgs84(coordinates)
  }

  return coordinates.map(convertCoordinates)
}

export function convertGeometry(geometry) {
  return {
    type: geometry.type,
    coordinates: convertCoordinates(geometry.coordinates)
  }
}
