import { healthRoutes } from './health.js'
import { cphsRoutes } from './cphs.js'
import { countyParish } from './api/countyParish.js'

const routes = [...healthRoutes, ...cphsRoutes, ...countyParish]

export { routes }
