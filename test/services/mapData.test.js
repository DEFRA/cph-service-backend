import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  isMapDataLoaded,
  loadMapData,
  MAP_DATA_STATUS_COLLECTION
} from '#/services/mapData.js'

// Identity conversion keeps the repaired OSGB36 coordinates easy to assert on.
vi.mock('#/helpers/osgb36.js', () => ({
  convertGeometry: (geometry) => geometry
}))

const polygon = (...rings) => ({ type: 'Polygon', coordinates: rings })

const feature = (id, geometry, properties = {}) => ({
  type: 'Feature',
  properties: {
    FID: id,
    FIRST_NM: `Parish ${id}`,
    CPNO: `${id}/001`,
    COUNTYREF: 10,
    PARISHREF: id,
    PSEUDOCODE: 'NO',
    X_COORD: 100 + id,
    Y_COORD: 200 + id,
    ...properties
  },
  geometry
})

const square = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
  [0, 0]
]

describe('#mapData service', () => {
  let dir
  let collection
  let db
  let logger

  const writeGeoJson = (features) => {
    const path = join(dir, 'data.geojson')
    writeFileSync(path, JSON.stringify({ type: 'FeatureCollection', features }))
    return path
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'map-data-'))
    collection = {
      findOne: vi.fn(),
      deleteOne: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({}),
      updateOne: vi.fn().mockResolvedValue({}),
      createIndex: vi.fn().mockResolvedValue('index'),
      insertMany: vi
        .fn()
        .mockImplementation(async (docs) => ({ insertedCount: docs.length }))
    }
    db = { collection: vi.fn().mockReturnValue(collection) }
    logger = { debug: vi.fn(), warn: vi.fn() }
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  describe('isMapDataLoaded', () => {
    test('Should be true when the completion marker exists', async () => {
      collection.findOne.mockResolvedValue({ _id: 'load', complete: true })

      expect(await isMapDataLoaded(db)).toBe(true)
      expect(db.collection).toHaveBeenCalledWith(MAP_DATA_STATUS_COLLECTION)
    })

    test('Should be false when there is no completion marker', async () => {
      collection.findOne.mockResolvedValue(null)

      expect(await isMapDataLoaded(db)).toBe(false)
    })
  })

  describe('loadMapData', () => {
    test('Should create indexes and insert mapped documents', async () => {
      const geoJsonPath = writeGeoJson([
        feature(1, polygon(square), { PSEUDOCODE: 'YES' })
      ])

      const result = await loadMapData(db, logger, { geoJsonPath })

      expect(result).toEqual({ inserted: 1, rejected: 0 })
      expect(collection.createIndex).toHaveBeenCalledWith({
        geometry: '2dsphere'
      })
      expect(collection.createIndex).toHaveBeenCalledWith({ cphNumber: 1 })
      expect(collection.insertMany).toHaveBeenCalledWith(
        [
          {
            _id: 1,
            name: 'Parish 1',
            cphNumber: '1/001',
            countyRef: 10,
            parishRef: 1,
            pseudoCode: true,
            geometry: polygon(square),
            geometryOsgb36: polygon(square),
            labelPointOsgb36: { easting: 101, northing: 201 }
          }
        ],
        { ordered: false }
      )
    })

    test('Should clear partial data first and mark completion last', async () => {
      const geoJsonPath = writeGeoJson([feature(1, polygon(square))])

      await loadMapData(db, logger, { geoJsonPath })

      expect(collection.deleteMany).toHaveBeenCalledWith({})
      expect(collection.deleteOne.mock.invocationCallOrder[0]).toBeLessThan(
        collection.insertMany.mock.invocationCallOrder[0]
      )
      expect(collection.updateOne.mock.invocationCallOrder[0]).toBeGreaterThan(
        collection.insertMany.mock.invocationCallOrder[0]
      )
    })

    test('Should insert in batches of 250', async () => {
      const features = Array.from({ length: 251 }, (_, i) =>
        feature(i, polygon(square))
      )
      const geoJsonPath = writeGeoJson(features)

      const result = await loadMapData(db, logger, { geoJsonPath })

      expect(result).toEqual({ inserted: 251, rejected: 0 })
      expect(collection.insertMany).toHaveBeenCalledTimes(2)
      expect(collection.insertMany.mock.calls[0][0]).toHaveLength(250)
      expect(collection.insertMany.mock.calls[1][0]).toHaveLength(1)
      expect(logger.debug).toHaveBeenCalledWith('Loaded 250 map features')
    })

    test('Should not insert when there are no features', async () => {
      const geoJsonPath = writeGeoJson([])

      const result = await loadMapData(db, logger, { geoJsonPath })

      expect(result).toEqual({ inserted: 0, rejected: 0 })
      expect(collection.insertMany).not.toHaveBeenCalled()
    })

    test('Should put the exterior ring first without altering the source', async () => {
      const hole = [
        [6, 2],
        [7, 2],
        [7, 3],
        [6, 2]
      ]
      const outer = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 0]
      ]
      const geoJsonPath = writeGeoJson([
        feature(1, polygon(hole, outer)),
        feature(2, {
          type: 'MultiPolygon',
          coordinates: [[hole, outer], [outer]]
        })
      ])

      await loadMapData(db, logger, { geoJsonPath })

      const [first, second] = collection.insertMany.mock.calls[0][0]
      expect(first.geometry.coordinates).toEqual([outer, hole])
      expect(first.geometryOsgb36.coordinates).toEqual([hole, outer])
      expect(second.geometry.coordinates).toEqual([[outer, hole], [outer]])
    })

    test('Should leave ring order alone when no ring contains the others', async () => {
      const a = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0]
      ]
      const b = [
        [5, 5],
        [6, 5],
        [6, 6],
        [5, 5]
      ]
      const geoJsonPath = writeGeoJson([feature(1, polygon(a, b))])

      await loadMapData(db, logger, { geoJsonPath })

      expect(collection.insertMany.mock.calls[0][0][0].geometry.coordinates).toEqual(
        [a, b]
      )
    })

    test('Should remove sub-metre spikes from the indexed geometry', async () => {
      const spiked = [
        [0, 0],
        [10, 0],
        [10.5, -0.5],
        [8, 1],
        [0, 5],
        [0, 0]
      ]
      const geoJsonPath = writeGeoJson([
        feature(1, polygon(spiked)),
        feature(2, { type: 'MultiPolygon', coordinates: [[spiked]] })
      ])

      await loadMapData(db, logger, { geoJsonPath })

      const expected = [
        [0, 0],
        [10, 0],
        [8, 1],
        [0, 5],
        [0, 0]
      ]
      const [first, second] = collection.insertMany.mock.calls[0][0]
      expect(first.geometry.coordinates).toEqual([expected])
      expect(first.geometryOsgb36.coordinates).toEqual([spiked])
      expect(second.geometry.coordinates).toEqual([[expected]])
    })

    test('Should keep rings that have no spikes', async () => {
      const geoJsonPath = writeGeoJson([feature(1, polygon(square))])

      await loadMapData(db, logger, { geoJsonPath })

      expect(collection.insertMany.mock.calls[0][0][0].geometry).toEqual(
        polygon(square)
      )
    })

    test('Should count and log rejected features', async () => {
      const geoJsonPath = writeGeoJson([
        feature(1, polygon(square)),
        feature(2, polygon(square))
      ])
      const longCoordinates = Array.from({ length: 30 }, (_, i) => `${i}.5,`)
        .join(' ')
        .padEnd(80, '1')
      collection.insertMany.mockRejectedValue({
        writeErrors: [{ index: 1, errmsg: `bad loop ${longCoordinates} end` }],
        result: { insertedCount: 1 }
      })

      const result = await loadMapData(db, logger, { geoJsonPath })

      expect(result).toEqual({ inserted: 1, rejected: 1 })
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Rejected map feature 2: bad loop')
      )
    })

    test('Should default inserted count to zero when the result is missing', async () => {
      const geoJsonPath = writeGeoJson([feature(1, polygon(square))])
      collection.insertMany.mockRejectedValue({
        writeErrors: [{ index: 5, errmsg: 'nope' }]
      })

      const result = await loadMapData(db, logger, { geoJsonPath })

      expect(result).toEqual({ inserted: 0, rejected: 1 })
      expect(logger.warn).toHaveBeenCalledWith(
        'Rejected map feature undefined: nope'
      )
    })

    test('Should rethrow errors that are not write errors', async () => {
      const geoJsonPath = writeGeoJson([feature(1, polygon(square))])
      const error = new Error('connection lost')
      collection.insertMany.mockRejectedValue(error)

      await expect(loadMapData(db, logger, { geoJsonPath })).rejects.toBe(error)
    })
  })
})
