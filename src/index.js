import { createServer } from '#/server.js'

async function start () {
  try {
    const server = await createServer()
    await server.start()

    server.logger.info(`Plugins Registered ${Object.keys(server.registrations).join(', ')}`)
    server.logger.info(`Server listening on ${server.info.uri}`)
    server.logger.info('Server started successfully')

    process.on('unhandledRejection', (error) => {
      console.log('Unhandled rejection', error)
      process.exitCode = 1
    })
  } catch (error) {
    console.error('Startup failed', error)
    process.exit(1)
  }
}

await start()
