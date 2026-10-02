import { health } from '#/routes/health.js'
import { cphs } from '../routes/api/cphs.js'
import { countyParish } from '../routes/api/countyParish.js'

const routes = [health, ...cphs, ...countyParish]

export const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
