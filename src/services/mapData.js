import { createReadStream } from 'node:fs'

import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'

import { convertGeometry } from '#/common/helpers/osgb36.js'

export const MAP_DATA_COLLECTION = 'cph-map-data'

const BATCH_SIZE = 250

export async function isMapDataLoaded(db) {
  const count = await db
    .collection(MAP_DATA_COLLECTION)
    .estimatedDocumentCount()

  return count > 0
}

export async function loadMapData(db, logger, { geoJsonPath }) {
  const collection = db.collection(MAP_DATA_COLLECTION)

  // Indexed up front so that geometry MongoDB cannot index is rejected on insert
  // rather than failing the whole build at the end of a long load.
  await collection.createIndex({ geometry: '2dsphere' })
  await collection.createIndex({ cphNumber: 1 })
  await collection.createIndex({ 'bboxOsgb36.minE': 1, 'bboxOsgb36.maxE': 1 })

  const features = createReadStream(geoJsonPath)
    .pipe(parser.asStream())
    .pipe(pick.asStream({ filter: 'features' }))
    .pipe(streamArray.asStream())

  let batch = []
  let inserted = 0
  let rejected = 0

  const flush = async () => {
    const result = await insertBatch(collection, batch, logger)
    inserted += result.inserted
    rejected += result.rejected
    batch = []
  }

  for await (const { value: feature } of features) {
    batch.push(toDocument(feature))

    if (batch.length === BATCH_SIZE) {
      await flush()
      logger.debug(`Loaded ${inserted} map features`)
    }
  }

  if (batch.length) {
    await flush()
  }

  return { inserted, rejected }
}

async function insertBatch(collection, batch, logger) {
  try {
    const { insertedCount } = await collection.insertMany(batch, {
      ordered: false
    })

    return { inserted: insertedCount, rejected: 0 }
  } catch (e) {
    if (!e.writeErrors) {
      throw e
    }

    for (const writeError of e.writeErrors) {
      logger.warn(
        `Rejected map feature ${batch[writeError.index]?._id}: ${summariseWriteError(writeError.errmsg)}`
      )
    }

    return {
      inserted: e.result?.insertedCount ?? 0,
      rejected: e.writeErrors.length
    }
  }
}

// Geo write errors embed the whole rejected document, so collapse long runs of
// coordinates to keep the reason readable in the logs.
function summariseWriteError(errmsg) {
  return String(errmsg)
    .replace(/[-\d.,\s[\]]{40,}/g, ' ... ')
    .slice(0, 300)
}

function toDocument(feature) {
  const {
    FID,
    FIRST_NM,
    CPNO,
    COUNTYREF,
    PARISHREF,
    PSEUDOCODE,
    X_COORD,
    Y_COORD
  } = feature.properties

  return {
    _id: FID,
    name: FIRST_NM,
    cphNumber: CPNO,
    countyRef: COUNTYREF,
    parishRef: PARISHREF,
    pseudoCode: PSEUDOCODE === 'YES',
    geometry: convertGeometry(repairGeometry(feature.geometry)),
    geometryOsgb36: feature.geometry,
    bboxOsgb36: boundingBox(feature.geometry),
    // Source X_COORD/Y_COORD; the dataset does not say whether these are a true
    // centroid or a label point, so the name claims neither.
    labelPointOsgb36: { easting: X_COORD, northing: Y_COORD }
  }
}

/**
 * Works around defects in the 1998 source geometry that MongoDB's 2dsphere index
 * rejects. Runs on OSGB36 metres, so spike thresholds are in metres. Only the
 * indexed WGS84 geometry is repaired; geometryOsgb36 stays as supplied.
 */
function repairGeometry(geometry) {
  const despiked = {
    type: geometry.type,
    coordinates:
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates.map((part) => part.map(removeSpikes))
        : geometry.coordinates.map(removeSpikes)
  }

  return repairRingOrder(despiked)
}

// Longer reversals are treated as real boundary detail and left alone.
const MAX_SPIKE_METRES = 1

/**
 * A few rings double back on themselves by a fraction of a metre, which makes
 * the edges either side of the reversal cross and invalidates the whole ring.
 * Drops the vertex closing the spike. Only this adjacent-edge shape is handled,
 * so other self-intersections still get rejected on insert.
 */
function removeSpikes(ring) {
  const points = ring.slice(0, -1)
  const n = points.length
  const spikes = new Set()

  for (let i = 0; i < n; i++) {
    const a = points[i]
    const b = points[(i + 1) % n]
    const c = points[(i + 2) % n]
    const d = points[(i + 3) % n]

    if (distance(b, c) <= MAX_SPIKE_METRES && segmentsCross(a, b, c, d)) {
      spikes.add((i + 2) % n)
    }
  }

  if (spikes.size === 0) {
    return ring
  }

  const kept = points.filter((_, i) => !spikes.has(i))

  return [...kept, kept[0]]
}

function distance([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1)
}

function segmentsCross(p1, p2, p3, p4) {
  const d1 = turn(p3, p4, p1)
  const d2 = turn(p3, p4, p2)
  const d3 = turn(p1, p2, p3)
  const d4 = turn(p1, p2, p4)

  return d1 * d2 < 0 && d3 * d4 < 0
}

function turn([ox, oy], [ax, ay], [bx, by]) {
  return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox)
}

/**
 * Six parishes list their hole before their exterior ring, which MongoDB rejects
 * because every ring after the first must sit inside the first. Moves the ring
 * that contains all the others to the front.
 */
export function repairRingOrder(geometry) {
  return {
    type: geometry.type,
    coordinates:
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates.map(outerRingFirst)
        : outerRingFirst(geometry.coordinates)
  }
}

function outerRingFirst(rings) {
  if (rings.length < 2) {
    return rings
  }

  const outer = rings.findIndex((ring, i) =>
    rings.every((other, j) => j === i || ringContainsPoint(ring, other[0]))
  )

  if (outer <= 0) {
    return rings
  }

  return [rings[outer], ...rings.filter((_, i) => i !== outer)]
}

function boundingBox(geometry) {
  let minE = Infinity
  let maxE = -Infinity
  let minN = Infinity
  let maxN = -Infinity

  const visit = (coordinates) => {
    if (typeof coordinates[0] === 'number') {
      const [e, n] = coordinates
      minE = Math.min(minE, e)
      maxE = Math.max(maxE, e)
      minN = Math.min(minN, n)
      maxN = Math.max(maxN, n)
      return
    }

    coordinates.forEach(visit)
  }

  visit(geometry.coordinates)

  return { minE, maxE, minN, maxN }
}

function ringContainsPoint(ring, [x, y]) {
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}
