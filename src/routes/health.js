export const healthRoutes = [
  {
    method: 'GET',
    path: '/health',
    handler: (_request, h) => h.response({ message: 'success' })
  }
]
