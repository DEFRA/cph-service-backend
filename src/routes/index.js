import { healthRoutes } from './health.js'
import { cphsRoutes } from './api/cphs.js'

const routes = [...healthRoutes, ...cphsRoutes]

export { routes }
