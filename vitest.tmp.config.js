import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'src/plugins/map-data.js',
        'src/services/mapData.js',
        'src/services/parishLookup.js'
      ]
    },
    setupFiles: ['.vite/setup-files.js']
  }
})
