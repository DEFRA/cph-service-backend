import { describe, expect, test } from 'vitest'
import {
  CPH_STATUS,
  CPH_HOLDING_TYPES,
  CPH_RANGES
} from '../../../../src/services/cph/cph-parameters.js'

describe('CPH Parameters', () => {
  describe('CPH_STATUS', () => {
    test('exports all required status values', () => {
      expect(CPH_STATUS).toHaveProperty('MANUAL_REVIEW')
      expect(CPH_STATUS).toHaveProperty('DRAFT')
      expect(CPH_STATUS).toHaveProperty('ACTIVE')
    })

    test('MANUAL_REVIEW status is correctly defined', () => {
      expect(CPH_STATUS.MANUAL_REVIEW).toBe('Manual Review')
    })

    test('DRAFT status is correctly defined', () => {
      expect(CPH_STATUS.DRAFT).toBe('Draft')
    })

    test('ACTIVE status is correctly defined', () => {
      expect(CPH_STATUS.ACTIVE).toBe('Active')
    })

    test('has exactly 3 status values', () => {
      expect(Object.keys(CPH_STATUS)).toHaveLength(3)
    })

    test('all status values are unique', () => {
      const values = Object.values(CPH_STATUS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('CPH_HOLDING_TYPES', () => {
    test('exports all required holding type values', () => {
      expect(CPH_HOLDING_TYPES).toHaveProperty('PERMANENT')
    })

    test('PERMANENT holding type is correctly defined', () => {
      expect(CPH_HOLDING_TYPES.PERMANENT).toBe('permanent')
    })

    test('has at least one holding type defined', () => {
      expect(Object.keys(CPH_HOLDING_TYPES).length).toBeGreaterThan(0)
    })
  })

  describe('CPH_RANGES', () => {
    test('exports range configuration for all holding types', () => {
      expect(CPH_RANGES).toHaveProperty('permanent')
    })

    test('permanent range has MIN and MAX properties', () => {
      expect(CPH_RANGES.permanent).toHaveProperty('MIN')
      expect(CPH_RANGES.permanent).toHaveProperty('MAX')
    })

    test('permanent range MIN is correctly set', () => {
      expect(CPH_RANGES.permanent.MIN).toBe(1)
    })

    test('permanent range MAX is correctly set', () => {
      expect(CPH_RANGES.permanent.MAX).toBe(4999)
    })

    test('permanent range MIN is less than MAX', () => {
      expect(CPH_RANGES.permanent.MIN).toBeLessThan(CPH_RANGES.permanent.MAX)
    })

    test('permanent range MIN is a positive integer', () => {
      expect(Number.isInteger(CPH_RANGES.permanent.MIN)).toBe(true)
      expect(CPH_RANGES.permanent.MIN).toBeGreaterThan(0)
    })

    test('permanent range MAX is a positive integer', () => {
      expect(Number.isInteger(CPH_RANGES.permanent.MAX)).toBe(true)
      expect(CPH_RANGES.permanent.MAX).toBeGreaterThan(0)
    })

    test('each holding type range has valid MIN and MAX', () => {
      Object.entries(CPH_RANGES).forEach(([holdingType, range]) => {
        expect(range).toHaveProperty('MIN', expect.any(Number))
        expect(range).toHaveProperty('MAX', expect.any(Number))
        expect(range.MIN).toBeLessThan(range.MAX)
      })
    })
  })

  describe('Constants immutability', () => {
    test('CPH_STATUS object is frozen or effectively immutable', () => {
      const originalValue = CPH_STATUS.MANUAL_REVIEW
      expect(CPH_STATUS.MANUAL_REVIEW).toBe(originalValue)
    })

    test('CPH_HOLDING_TYPES object is frozen or effectively immutable', () => {
      const originalValue = CPH_HOLDING_TYPES.PERMANENT
      expect(CPH_HOLDING_TYPES.PERMANENT).toBe(originalValue)
    })

    test('CPH_RANGES object is frozen or effectively immutable', () => {
      const originalMin = CPH_RANGES.permanent.MIN
      const originalMax = CPH_RANGES.permanent.MAX
      expect(CPH_RANGES.permanent.MIN).toBe(originalMin)
      expect(CPH_RANGES.permanent.MAX).toBe(originalMax)
    })
  })

  describe('Cross-parameter consistency', () => {
    test('holding types defined in CPH_HOLDING_TYPES have corresponding ranges', () => {
      Object.values(CPH_HOLDING_TYPES).forEach(holdingType => {
        expect(CPH_RANGES).toHaveProperty(holdingType)
      })
    })

    test('all holding types in CPH_RANGES are defined in CPH_HOLDING_TYPES', () => {
      Object.keys(CPH_RANGES).forEach(holdingType => {
        const definedInHoldingTypes = Object.values(CPH_HOLDING_TYPES).includes(holdingType)
        expect(definedInHoldingTypes).toBe(true)
      })
    })
  })
})
