import { findCphs } from '../handlers/cphs/find.js'
import { createCph } from '../handlers/cphs/create.js'
import { deleteCphs } from '../handlers/cphs/delete.js'

export const cphsRoutes = [
  {
    method: 'GET',
    path: '/api/cphs',
    handler: findCphs
  },
  {
    method: 'POST',
    path: '/api/cphs',
    handler: createCph
  },
  {
    method: 'DELETE',
    path: '/api/cphs',
    handler: deleteCphs
  }
]
