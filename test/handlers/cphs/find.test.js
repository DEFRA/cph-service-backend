import { describe, expect, test } from 'vitest'
import { findCphs } from '../../../src/handlers/cphs/find.js'

describe('findCphs', () => {
  test('returns the array of CPH values from the database', async () => {
    const request = {
      db: {
        collection: () => ({
          find: () => ({
            toArray: async () => [{ cph: 'CPH-1' }, { cph: 'CPH-2' }]
          })
        })
      },
      logger: {
        info: () => {}
      }
    }

    const response = await findCphs(request, {})

    expect(response).toEqual({ cphs: ['CPH-1', 'CPH-2'] })
  })
})
