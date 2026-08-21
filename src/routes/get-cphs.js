export const cphs = [
  {
    method: 'GET',
    path: '/api/cphs',
    handler: async (request, h) => {
      const cphs = {
        cphs: ['12/345/6789', '11/222/3333']
      }
      return h.response(cphs)
    }
  }
]
