import { afterAll, beforeAll } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

// The OSTN15 grid file is too large for git, so it is unavailable in CI
vi.mock('#/common/helpers/osgb36.js', () => ({
  initOsgb36ToWgs84: vi.fn(),
  osgb36ToWgs84: vi.fn()
}))

const fetchMock = createFetchMock(vi)

beforeAll(async () => {
  // Setup fetch mock
  fetchMock.enableMocks()
  global.fetch = fetchMock
  global.fetchMock = fetchMock
})

afterAll(async () => {
  fetchMock.disableMocks()
})
