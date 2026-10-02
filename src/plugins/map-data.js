import { isMapDataLoaded, loadMapData } from '#/services/mapData.js'
import { initOsgb36ToWgs84 } from '#/common/helpers/osgb36.js'

export const mapData = {
  plugin: {
    name: 'map-data',
    version: '1.0.0',
    register: async function (server, options) {
      // Needed by the lookup routes too, so it cannot live inside the load path.
      initOsgb36ToWgs84(options.ostn15Path)

      // Loading is slow, so it runs in the background rather than blocking startup.
      server.events.on('start', () => {
        load(server, options).catch((e) =>
          server.logger.error(e, 'Failed to load map data')
        )
      })
    }
  }
}

async function load(server, options) {
  // Guards against concurrent loads when more than one instance starts up.
  const lock = await server.locker.lock('cph-map-data-load')

  if (!lock) {
    server.logger.info('Map data load already in progress elsewhere')
    return
  }

  try {
    if (await isMapDataLoaded(server.db)) {
      server.logger.info('Map data already loaded, skipping')
      return
    }

    server.logger.info('Loading map data')
    const { inserted, rejected } = await loadMapData(
      server.db,
      server.logger,
      options
    )
    server.logger.info(
      `Loaded ${inserted} map features (${rejected} rejected)`
    )
  } catch (e) {
    server.logger.error(e, 'Failed to load map data')
  } finally {
    await lock.free()
  }
}
