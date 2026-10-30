import { describe, expect, test } from 'vitest'
import { findCountyParish } from '../../../src/handlers/county-parish/find.js'
import { findParishesByWgs84 } from '../../../src/services/parishLookup.js'

vi.mock('../../../src/services/parishLookup.js', () => ({
  findParishesByWgs84: vi.fn()
}))

describe('findCountyParish', () => {
  test('returns the parishes for the supplied easting and northing', async () => {
    const parishes = [{ name: 'Test Parish', countyRef: 1, parishRef: 2 }]
    const request = {
      db: {},
      query: { easting: 123, northing: 456 },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }

    findParishesByWgs84.mockResolvedValue(parishes)

    const response = await findCountyParish(request, {})

    expect(findParishesByWgs84).toHaveBeenCalledWith(request.db, 123, 456)
    expect(request.logger.info).toHaveBeenCalledWith(
      `Fetched ${parishes.length} county parishes`
    )
    expect(response).toEqual({ parishes })
  })

  test('throws a Boom 500 if the parish lookup fails', async () => {
    const request = {
      db: {},
      query: { easting: 123, northing: 456 },
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    }
    const err = new Error('Lookup failed')

    findParishesByWgs84.mockRejectedValue(err)

    await expect(findCountyParish(request, {})).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 500 }
    })
    expect(request.logger.error).toHaveBeenCalledWith(
      err,
      'Failed to fetch county parishes'
    )
  })
})
