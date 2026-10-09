import { healthRoutes } from './health.js'
import { cphsRoutes } from './cphs.js'

const routes = [...healthRoutes, ...cphsRoutes]

export { routes }
