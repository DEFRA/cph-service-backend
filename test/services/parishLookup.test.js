import { findParishesByWgs84 } from '#/services/parishLookup.js'
import { MAP_DATA_COLLECTION } from '#/services/mapData.js'
import { osgb36ToWgs84 } from '#/helpers/osgb36.js'

vi.mock('#/helpers/osgb36.js', () => ({
  osgb36ToWgs84: vi.fn()
}))

describe('#findParishesByWgs84', () => {
  test('Should query by the reprojected point and return matches', async () => {
    const parishes = [{ name: 'A', countyRef: 1, parishRef: 2 }]
    const toArray = vi.fn().mockResolvedValue(parishes)
    const find = vi.fn().mockReturnValue({ toArray })
    const collection = vi.fn().mockReturnValue({ find })
    osgb36ToWgs84.mockReturnValue([-1.5, 52.1])

    const result = await findParishesByWgs84({ collection }, 400000, 300000)

    expect(osgb36ToWgs84).toHaveBeenCalledWith([400000, 300000])
    expect(collection).toHaveBeenCalledWith(MAP_DATA_COLLECTION)
    expect(find).toHaveBeenCalledWith(
      {
        geometry: {
          $geoIntersects: {
            $geometry: { type: 'Point', coordinates: [-1.5, 52.1] }
          }
        }
      },
      {
        projection: { _id: 0, name: 1, countyRef: 1, parishRef: 1 },
        sort: { _id: 1 }
      }
    )
    expect(result).toBe(parishes)
  })
})
