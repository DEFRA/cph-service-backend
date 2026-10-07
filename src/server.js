import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { secureContext } from '@defra/hapi-secure-context'
import { config } from '#/config.js'
import { mongoDb } from '#/plugins/mongodb.js'
import { metrics } from '@defra/cdp-metrics'
import { consumer } from './plugins/sqs-consumer.js'
import hapiPino from 'hapi-pino'
import { loggerOptions } from './plugins/options/hapi-pino-options.js'
import { tracing as hapiTracing } from '@defra/hapi-tracing'
import hapiPulse from 'hapi-pulse'
import { routes } from './routes/index.js'

const failAction = function (_request, _h, error) {
  _request.logger.error('Validation failed', { error })
  throw Boom.badRequest('Validation failed', error)
}

export async function createServer () {
  const server = Hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  // Hapi Plugins:
  // requestLogger  - automatically logs incoming requests
  // requestTracing - trace header logging and propagation
  // secureContext  - loads CA certificates from environment config
  // pulse          - provides shutdown handlers
  // mongoDb        - sets up mongo connection pool and attaches to `server` and `request` objects

  const tenSeconds = 10 * 1000

  await server.register([
    metrics,
    secureContext,
    { plugin: hapiPino, options: loggerOptions },
    { plugin: hapiTracing.plugin, options: { tracingHeader: config.get('tracing.header') } },
    { plugin: hapiPulse, options: { logger: server.logger, timeout: tenSeconds } },
    { plugin: mongoDb, options: config.get('mongo') },
    { plugin: consumer, options: config.get('sqs') }
  ])

  server.route(routes)

  return server
}
