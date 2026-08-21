const cphStore = []

export const cphs = [
  {
    method: 'GET',
    path: '/api/cphs',
    handler: async (request, h) => {
      return h.response({ cphs: cphStore })
    }
  },
  {
    method: 'POST',
    path: '/api/cphs',
    handler: async (request, h) => {
      const cph = request.payload.cph
      cphStore.push(cph)
      console.log(cphStore)
      return h.response().code(201).header('Location', '/api/cphs')
    }
  },
  {
    method: 'DELETE',
    path: '/api/cphs',
    handler: async (request, h) => {
      cphStore.length = 0
      console.log(cphStore)
      return h.response().code(204)
    }
  }
]
