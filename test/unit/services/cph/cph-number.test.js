import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { generateCphNumber } from '../../../../src/services/cph/cph-number.js'
import { CPH_HOLDING_TYPES, CPH_RANGES } from '../../../../src/services/cph/cph-parameters.js'

describe('generateCphNumber', () => {
  let server
  let mockDb
  let mockSequenceCollection

  beforeEach(() => {
    mockSequenceCollection = {
      findOneAndUpdate: vi.fn()
    }

    mockDb = {
      collection: vi.fn()
    }

    server = {
      db: mockDb,
      findParishesByWgs84: vi.fn(),
      logger: {
        error: vi.fn()
      }
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('successful CPH generation', () => {
    test('generates a correctly formatted CPH number with zero-padded segments', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: 1, cpNumber: '05/042', holdingType: 'permanent'
      })

      const result = await generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT)

      expect(result).toBe('05/042/0001')
    })

    test('uses holdingRange.MIN for first sequence number when record does not exist', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: CPH_RANGES.permanent.MIN, cpNumber: '05/042', holdingType: 'permanent'
      })

      const result = await generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT)

      expect(result).toBe(`05/042/${String(CPH_RANGES.permanent.MIN).padStart(4, '0')}`)
      expect(mockSequenceCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { cpNumber: '05/042', holdingType: 'permanent' },
        expect.any(Array),
        {
          upsert: true,
          returnDocument: 'after'
        }
      )

      // Verify the aggregation pipeline uses holdingRange.MIN
      const callArgs = mockSequenceCollection.findOneAndUpdate.mock.calls[0]
      const pipeline = callArgs[1]
      const condExpression = pipeline[0].$set.sequence.$cond

      // The $cond should have the MIN value as the second element (true case)
      expect(condExpression[1]).toBe(CPH_RANGES.permanent.MIN)
    })

    test('increments the holding number for subsequent CPH generation in same parish', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 10,
          parishRef: 100
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)

      // First call returns sequence 1
      mockSequenceCollection.findOneAndUpdate.mockResolvedValueOnce({
        sequence: 1, cpNumber: '10/100', holdingType: 'permanent'
      })
      await generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT)

      // Verify the aggregation pipeline contains the $add operator for increment
      const firstCallArgs = mockSequenceCollection.findOneAndUpdate.mock.calls[0]
      const pipeline = firstCallArgs[1]
      const condExpression = pipeline[0].$set.sequence.$cond
      // The $cond's false case should contain the increment operation
      expect(condExpression[2]).toEqual({ $add: ['$sequence', 1] })
    })

    test('handles large county and parish reference numbers', async () => {
      const mockParishData = [
        {
          name: 'Large Parish',
          countyRef: 99,
          parishRef: 999
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: 4999, cpNumber: '99/999', holdingType: 'permanent'
      })

      const result = await generateCphNumber(server, 500000, 500000, CPH_HOLDING_TYPES.PERMANENT)

      expect(result).toBe('99/999/4999')
    })

    test('handles single digit county and parish references', async () => {
      const mockParishData = [
        {
          name: 'Small Parish',
          countyRef: 1,
          parishRef: 2
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: 3, cpNumber: '01/002', holdingType: 'permanent'
      })

      const result = await generateCphNumber(server, 100, 200, CPH_HOLDING_TYPES.PERMANENT)

      expect(result).toBe('01/002/0003')
    })

    test('correctly calls findOneAndUpdate with upsert operation', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        value: { sequence: 1, cpNumber: '05/042', holdingType: 'permanent' }
      })

      await generateCphNumber(server, 123456, 789012, 'permanent')

      expect(mockDb.collection).toHaveBeenCalledWith('cph-sequences')
      expect(mockSequenceCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { cpNumber: '05/042', holdingType: 'permanent' },
        expect.any(Array),
        { upsert: true, returnDocument: 'after' }
      )
    })

    test('uses atomic aggregation pipeline to set initial MIN or increment', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        value: { sequence: 1, cpNumber: '05/042', holdingType: 'permanent' }
      })

      await generateCphNumber(server, 123456, 789012, 'permanent')

      const calls = mockSequenceCollection.findOneAndUpdate.mock.calls
      expect(calls.length).toBe(1)
      expect(calls[0][1]).toEqual(expect.any(Array))
      expect(calls[0][1][0]).toHaveProperty('$set')
      expect(calls[0][1][0].$set).toHaveProperty('sequence')
    })
  })

  describe('error handling', () => {
    test('throws error when no parish information is found', async () => {
      server.findParishesByWgs84.mockResolvedValue([])

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('No parish information found for the given coordinates')
    })

    test('throws error when parish information is null', async () => {
      server.findParishesByWgs84.mockResolvedValue(null)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('No parish information found for the given coordinates')
    })

    test('throws error when parish validation fails - missing name', async () => {
      const invalidParishData = [
        {
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(invalidParishData)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('Parish information validation failed')
    })

    test('throws error when parish validation fails - missing countyRef', async () => {
      const invalidParishData = [
        {
          name: 'Test Parish',
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(invalidParishData)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('Parish information validation failed')
    })

    test('throws error when parish validation fails - missing parishRef', async () => {
      const invalidParishData = [
        {
          name: 'Test Parish',
          countyRef: 5
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(invalidParishData)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('Parish information validation failed')
    })

    test('throws error when parish validation fails - invalid countyRef type', async () => {
      const invalidParishData = [
        {
          name: 'Test Parish',
          countyRef: 'invalid',
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(invalidParishData)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('Parish information validation failed')
    })

    test('throws error when findParishesByWgs84 fails', async () => {
      const error = new Error('Database connection failed')
      server.findParishesByWgs84.mockRejectedValue(error)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('Database connection failed')
    })

    test('throws error when sequence collection update fails', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      const error = new Error('MongoDB update failed')
      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockRejectedValue(error)

      await expect(generateCphNumber(server, 123456, 789012, CPH_HOLDING_TYPES.PERMANENT))
        .rejects
        .toThrow('MongoDB update failed')
    })

    test('throws error when holding number exceeds MAX range', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: 5000, cpNumber: '05/042', holdingType: 'permanent'
      })

      await expect(generateCphNumber(server, 123456, 789012, 'permanent'))
        .rejects
        .toThrow('Holding number exceeds the maximum allowed value for holding type permanent of 4999')
    })

    test('logs error to console when generation fails', async () => {
      const error = new Error('Generation failed')
      server.findParishesByWgs84.mockRejectedValue(error)

      try {
        await generateCphNumber(server, 123456, 789012, 'permanent')
      } catch (e) {
        // Expected to throw
      }

      expect(server.logger.error).toHaveBeenCalledWith('Failed to generate CPH number:', error)
    })
  })

  describe('coordinate handling', () => {
    test('passes easting and northing correctly to findParishesByWgs84', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        value: { sequence: 1, cpNumber: '05/042', holdingType: 'permanent' }
      })

      const easting = 456789
      const northing = 123456

      await generateCphNumber(server, easting, northing, 'permanent')

      expect(server.findParishesByWgs84).toHaveBeenCalledWith(server.db, easting, northing)
    })
  })

  describe('multiple parish data', () => {
    test('uses only the first parish when multiple are returned', async () => {
      const mockParishData = [
        {
          name: 'First Parish',
          countyRef: 5,
          parishRef: 42
        },
        {
          name: 'Second Parish',
          countyRef: 10,
          parishRef: 50
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        sequence: 1, cpNumber: '05/042', holdingType: 'permanent'
      })

      const result = await generateCphNumber(server, 123456, 789012, 'permanent')

      expect(result).toBe('05/042/0001')
    })
  })

  describe('concurrency protection', () => {
    test('uses atomic findOneAndUpdate to prevent duplicate sequence numbers', async () => {
      const mockParishData = [
        {
          name: 'Test Parish',
          countyRef: 5,
          parishRef: 42
        }
      ]

      server.findParishesByWgs84.mockResolvedValue(mockParishData)
      mockDb.collection.mockReturnValue(mockSequenceCollection)
      mockSequenceCollection.findOneAndUpdate.mockResolvedValue({
        value: { sequence: 1, cpNumber: '05/042', holdingType: 'permanent' }
      })

      await generateCphNumber(server, 123456, 789012, 'permanent')

      // Verify findOneAndUpdate is used (atomic operation) instead of separate update+find
      expect(mockSequenceCollection.findOneAndUpdate).toHaveBeenCalled()
      expect(mockSequenceCollection.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ cpNumber: '05/042', holdingType: 'permanent' }),
        expect.any(Array),
        { upsert: true, returnDocument: 'after' }
      )
    })
  })
})
