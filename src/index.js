import { createServer } from '#/server.js'

const server = await createServer()
await server.start()

server.logger.info('Server started successfully')
server.logger.info(`Access your backend on http://localhost:${config.get('port')}`)
server.logger.info(`Server listening on ${server.info.uri}`)
server.logger.info(`Pligins Registered ${Object.keys(server.registrations).join(', ')}`)

process.on('unhandledRejection', (error) => {
  server.logger.info('Unhandled rejection', error)
  process.exitCode = 1
})
