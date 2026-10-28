import { mapData } from '#/plugins/map-data.js'
import { isMapDataLoaded, loadMapData } from '#/services/mapData.js'
import { initOsgb36ToWgs84 } from '#/helpers/osgb36.js'

const gridBuffer = Buffer.from('grid')
const geoJsonStream = { stream: true }

vi.mock('#/helpers/s3.js', () => ({
  createS3Client: vi.fn(() => 's3'),
  getObjectBuffer: vi.fn(async () => gridBuffer),
  getObjectStream: vi.fn(async () => geoJsonStream)
}))

vi.mock('#/services/mapData.js', () => ({
  isMapDataLoaded: vi.fn(),
  loadMapData: vi.fn()
}))
vi.mock('#/helpers/osgb36.js', () => ({
  initOsgb36ToWgs84: vi.fn()
}))

describe('#mapData plugin', () => {
  const options = {
    bucket: 'bucket',
    awsRegion: 'eu-west-2',
    ostn15Key: 'grid.gsb',
    geoJsonKey: 'data.geojson'
  }
  let server
  let lock
  let startHandler

  const start = async () => {
    startHandler()
    await vi.waitFor(() => expect(lock.free).toHaveBeenCalled())
  }

  beforeEach(async () => {
    lock = { free: vi.fn().mockResolvedValue() }
    server = {
      db: {},
      logger: { info: vi.fn(), error: vi.fn() },
      locker: { lock: vi.fn().mockResolvedValue(lock) },
      events: {
        on: vi.fn((name, handler) => {
          startHandler = handler
        })
      }
    }
    isMapDataLoaded.mockResolvedValue(false)
    loadMapData.mockResolvedValue({ inserted: 5, rejected: 1 })

    await mapData.plugin.register(server, options)
  })

  test('Should have plugin name', () => {
    expect(mapData.plugin.name).toBe('map-data')
  })

  test('Should initialise the converter at registration', () => {
    expect(initOsgb36ToWgs84).toHaveBeenCalledWith(gridBuffer)
    expect(server.events.on).toHaveBeenCalledWith('start', expect.any(Function))
  })

  test('Should load map data on start when not loaded', async () => {
    await start()

    expect(server.locker.lock).toHaveBeenCalledWith('cph-map-data-load')
    expect(loadMapData).toHaveBeenCalledWith(server.db, server.logger, {
      geoJsonStream
    })
    expect(server.logger.info).toHaveBeenCalledWith(
      'Loaded 5 map features (1 rejected)'
    )
  })

  test('Should skip loading when already loaded', async () => {
    isMapDataLoaded.mockResolvedValue(true)

    await start()

    expect(loadMapData).not.toHaveBeenCalled()
    expect(server.logger.info).toHaveBeenCalledWith(
      'Map data already loaded, skipping'
    )
  })

  test('Should do nothing when the lock is held elsewhere', async () => {
    server.locker.lock.mockResolvedValue(null)

    startHandler()
    await vi.waitFor(() =>
      expect(server.logger.info).toHaveBeenCalledWith(
        'Map data load already in progress elsewhere'
      )
    )

    expect(isMapDataLoaded).not.toHaveBeenCalled()
    expect(lock.free).not.toHaveBeenCalled()
  })

  test('Should log the error and free the lock when loading fails', async () => {
    const error = new Error('boom')
    loadMapData.mockRejectedValue(error)

    await start()

    expect(server.logger.error).toHaveBeenCalledWith(
      error,
      'Failed to load map data'
    )
  })

  test('Should log an error when acquiring the lock fails', async () => {
    const error = new Error('lock failed')
    server.locker.lock.mockRejectedValue(error)

    startHandler()

    await vi.waitFor(() =>
      expect(server.logger.error).toHaveBeenCalledWith(
        error,
        'Failed to load map data'
      )
    )
  })
})
