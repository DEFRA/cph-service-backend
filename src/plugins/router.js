import { health } from '#/routes/health.js'
import { example } from '#/routes/example.js'
import { cphs } from '../routes/api/cphs.js'

const routes = [health, example, cphs].flat()

export const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
