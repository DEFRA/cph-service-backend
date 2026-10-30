import { healthRoutes } from './health.js'
import { cphsRoutes } from './cphs.js'
import { countyParish } from './county-parish.js'

const routes = [...healthRoutes, ...cphsRoutes, ...countyParish]

export { routes }
