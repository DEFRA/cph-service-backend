import { Db, MongoClient } from 'mongodb'
import { LockManager } from 'mongo-locks'
import {
  beforeAll,
  describe,
  expect,
  test,
  vi
} from 'vitest'

vi.mock('stream-json', () => ({
  parser: {
    asStream: () => ({ pipe: () => ({ pipe: () => ({}) }) })
  }
}))

vi.mock('stream-json/filters/pick.js', () => ({
  pick: {
    asStream: () => ({ pipe: () => ({}) })
  }
}))

vi.mock('stream-json/streamers/stream-array.js', () => ({
  streamArray: {
    asStream: () => ({})
  }
}))

vi.mock('proj4', () => {
  const proj4 = Object.assign(
    vi.fn(() => ({ forward: vi.fn((point) => point) })),
    {
      nadgrid: vi.fn(),
      defs: vi.fn()
    }
  )

  return { default: proj4 }
})

vi.mock('#/plugins/map-data.js', () => ({
  mapData: {
    plugin: {
      name: 'map-data',
      version: '1.0.0',
      register: async () => {}
    }
  }
}))

describe('#mongoDb', () => {
  let server

  describe('Set up', () => {
    beforeAll(async () => {
      // Dynamic import needed due to config being updated by vitest-mongodb
      const { createServer } = await import('#/server.js')

      server = await createServer()
      await server.initialize()
    })

    test('Server should have expected MongoDb decorators', () => {
      expect(server.db).toBeInstanceOf(Db)
      expect(server.mongoClient).toBeInstanceOf(MongoClient)
      expect(server.locker).toBeInstanceOf(LockManager)
    })

    test('MongoDb should have expected database name', () => {
      expect(server.db.databaseName).toBe('cph-service-backend')
    })

    test('MongoDb should have expected namespace', () => {
      expect(server.db.namespace).toBe('cph-service-backend')
    })

    test('raw-form-submissions should reject duplicate referenceNumber', async () => {
      const collection = server.db.collection('raw-form-submissions')
      await collection.insertOne({ referenceNumber: 'DUP-INDEX-TEST' })

      await expect(
        collection.insertOne({ referenceNumber: 'DUP-INDEX-TEST' })
      ).rejects.toMatchObject({ code: 11000 })

      await collection.deleteMany({ referenceNumber: 'DUP-INDEX-TEST' })
    })

    test('cph-records should reject duplicate source.rawSubmissionId', async () => {
      const collection = server.db.collection('cph-records')
      await collection.insertOne({ source: { rawSubmissionId: 'DUP-INDEX-TEST' } })

      await expect(
        collection.insertOne({ source: { rawSubmissionId: 'DUP-INDEX-TEST' } })
      ).rejects.toMatchObject({ code: 11000 })

      await collection.deleteMany({ 'source.rawSubmissionId': 'DUP-INDEX-TEST' })
    })
  })

  describe('Shut down', () => {
    beforeAll(async () => {
      // Dynamic import needed due to config being updated by vitest-mongodb
      const { createServer } = await import('#/server.js')

      server = await createServer()
      await server.initialize()
    })

    test('Should close Mongo client on server stop', async () => {
      const closeSpy = vi.spyOn(server.mongoClient, 'close')
      await server.stop({ timeout: 1000 })

      expect(closeSpy).toHaveBeenCalledWith(true)
    })
  })
})
