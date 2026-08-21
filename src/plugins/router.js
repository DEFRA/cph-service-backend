import { health } from '#/routes/health.js'
import { cphs } from '../routes/api/cphs.js'

const routes = [health, ...cphs]

export const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
