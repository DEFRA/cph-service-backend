import {
  insertCPH,
  findAllCPHs,
  deleteAllCPHs
} from '../../services/cphData.js'

export const cphs = [
  {
    method: 'GET',
    path: '/api/cphs',
    handler: async (request, h) => {
      const cphData = await findAllCPHs(request.db)
      const cphs = cphData.map((cph) => cph.cph)
      return h.response({ cphs })
    }
  },
  {
    method: 'POST',
    path: '/api/cphs',
    handler: async (request, h) => {
      const res = await insertCPH(request.db, request.payload)
      console.log(res)
      return h.response().code(201).header('Location', '/api/cphs')
    }
  },
  {
    method: 'DELETE',
    path: '/api/cphs',
    handler: async (request, h) => {
      const res = await deleteAllCPHs(request.db)
      console.log(res)
      return h.response().code(204)
    }
  }
]
