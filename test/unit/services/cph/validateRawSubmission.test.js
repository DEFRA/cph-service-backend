import { describe, expect, test } from 'vitest'
import { validateRawSubmissionBody, validateRawSubmissionMeta } from '../../../../src/services/cph/validateRawSubmission.js'

describe('validateRawSubmissionBody', () => {
  const validBody = {
    data: {
      main: {
        yDwSNa: { year: 2020, month: 1, day: 1 },
        vumpmr: ['sheep'],
        rOgnUv: true
      },
      repeaters: {
        hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
      }
    }
  }

  const validBodyMultipleLocations = {
    data: {
      main: {
        yDwSNa: { year: 2025, month: 12, day: 31 },
        vumpmr: ['cattle', 'sheep', 'pigs'],
        rOgnUv: false,
        qLmGSL: true,
        uuQMUp: false
      },
      repeaters: {
        hNCJCl: [
          { UOmNur: { easting: 100, northing: 200 } },
          { UOmNur: { easting: 300, northing: 400 } }
        ]
      }
    }
  }

  const validBodyWithExtraFields = {
    data: {
      main: {
        yDwSNa: { year: 2024, month: 6, day: 15 },
        vumpmr: ['horses'],
        rOgnUv: true,
        extraField1: 'allowed'
      },
      repeaters: {
        hNCJCl: [{ UOmNur: { easting: 250, northing: 500 } }]
      },
      extraField3: 'allowed'
    },
    extraField4: 'allowed'
  }

  // ===== VALID SUBMISSIONS =====

  test('validates a valid submission with minimum required fields', async () => {
    const errors = await validateRawSubmissionBody(validBody)
    expect(errors).toEqual([])
  })

  test('validates a valid submission with multiple livestock types', async () => {
    const errors = await validateRawSubmissionBody(validBodyMultipleLocations)
    expect(errors).toEqual([])
  })

  test('validates a valid submission with extra fields at all levels', async () => {
    const errors = await validateRawSubmissionBody(validBodyWithExtraFields)
    expect(errors).toEqual([])
  })

  test('validates a valid submission with leap year date', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 2, day: 29 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toEqual([])
  })

  test('validates a valid submission with maximum date values', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2050, month: 12, day: 31 },
          vumpmr: ['goats'],
          rOgnUv: false,
          qLmGSL: true,
          uuQMUp: false
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 999999, northing: 999999 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toEqual([])
  })

  // ===== MISSING REQUIRED FIELDS =====

  test('returns error when data is missing', async () => {
    const submission = {}
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data" is required')
  })

  test('returns error when data.main is missing', async () => {
    const submission = { data: {} }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.map(e => e.failure)).toContain('"data.main" is required')
  })

  test('returns error when data.main.yDwSNa is missing', async () => {
    const submission = {
      data: {
        main: {
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa" is required')
  })

  test('returns error when data.main.vumpmr is missing', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.vumpmr" is required')
  })

  test('returns error when data.main.rOgnUv is missing', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep']
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.rOgnUv" is required')
  })

  test('returns error when data.repeaters is missing', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.repeaters" is required')
  })

  test('returns error when data.repeaters.hNCJCl is missing', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {}
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.repeaters.hNCJCl" is required')
  })

  // ===== TYPE VALIDATION =====

  test('returns error when data.main.rOgnUv is a string instead of boolean', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: 'yes'
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.rOgnUv" must be a boolean')
  })

  test('returns error when data.main.rOgnUv is a number instead of boolean', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: 1
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.rOgnUv" must be a boolean')
  })

  test('returns error when data.main.vumpmr is a string instead of array', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: 'sheep',
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.vumpmr" must be an array')
  })

  test('returns error when easting is a string instead of number', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: '100', northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.map(e => e.failure)).toContain('"data.repeaters.hNCJCl[0].UOmNur.easting" must be a number')
  })

  test('returns error when northing is a string instead of number', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: '200' } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.map(e => e.failure)).toContain('"data.repeaters.hNCJCl[0].UOmNur.northing" must be a number')
  })

  // ===== ARRAY VALIDATION =====

  test('returns error when vumpmr is an empty array', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: [],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.vumpmr" must contain at least 1 items')
  })

  test('returns error when hNCJCl is an empty array', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: []
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.repeaters.hNCJCl" does not contain 1 required value(s)')
  })

  // ===== DATE VALIDATION =====

  test('returns error when date is Feb 29 in non-leap year', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2021, month: 2, day: 29 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa" must be a real date')
  })

  test('returns error when date is April 31', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 4, day: 31 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa" must be a real date')
  })

  test('returns error when day is 0', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 0 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa.day" must be greater than or equal to 1')
  })

  test('returns error when month is 13', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 13, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa.month" must be less than or equal to 12')
  })

  test('returns error when month is 0', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 0, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa.month" must be greater than or equal to 1')
  })

  test('returns error when year is less than 2020', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2019, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"data.main.yDwSNa.year" must be greater than or equal to 2020')
  })

  test('returns error when day exceeds 31', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 32 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [{ UOmNur: { easting: 100, northing: 200 } }]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors).toHaveLength(1)
  })

  // ===== MULTIPLE ERRORS =====

  test('collects multiple errors when multiple validations fail', async () => {
    const submission = {
      data: {
        main: {
          vumpmr: 'sheep',
          rOgnUv: 'yes'
        },
        repeaters: {
          hNCJCl: []
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors.length).toBeGreaterThan(1)
    expect(errors.map(e => e.failure)).toContain('"data.main.yDwSNa" is required')
    expect(errors.map(e => e.failure)).toContain('"data.main.vumpmr" must be an array')
    expect(errors.map(e => e.failure)).toContain('"data.main.rOgnUv" must be a boolean')
  })

  test('collects multiple coordinate errors', async () => {
    const submission = {
      data: {
        main: {
          yDwSNa: { year: 2020, month: 1, day: 1 },
          vumpmr: ['sheep'],
          rOgnUv: true
        },
        repeaters: {
          hNCJCl: [
            { UOmNur: { easting: '100', northing: '200' } },
            { UOmNur: { easting: 'abc', northing: 'xyz' } }
          ]
        }
      }
    }
    const errors = await validateRawSubmissionBody(submission)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('validateRawSubmissionMeta', () => {
  const validMeta = {
    meta: {
      referenceNumber: 'ref123',
      formId: 'form456',
      versionMetadata: {
        versionNumber: 1
      },
      timestamp: '2024-01-01T00:00:00Z'
    }
  }

  const validMetaWithExtraFields = {
    meta: {
      referenceNumber: 'ref789',
      formId: 'formABC',
      versionMetadata: {
        versionNumber: 2,
        extraField: 'allowed'
      },
      timestamp: '2025-12-31T23:59:59Z',
      extraField: 'allowed'
    },
    extraField: 'allowed'
  }

  // ===== VALID SUBMISSIONS =====

  test('validates a valid meta submission', async () => {
    const errors = await validateRawSubmissionMeta(validMeta)
    expect(errors).toEqual([])
  })

  test('validates a valid meta submission with extra fields', async () => {
    const errors = await validateRawSubmissionMeta(validMetaWithExtraFields)
    expect(errors).toEqual([])
  })

  test('validates meta with different ISO date formats', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref001',
        formId: 'form001',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024-06-15T14:30:00+00:00'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toEqual([])
  })

  test('validates meta with simple ISO date', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref002',
        formId: 'form002',
        versionMetadata: {
          versionNumber: 5
        },
        timestamp: '2024-01-01'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toEqual([])
  })

  // ===== MISSING REQUIRED FIELDS =====

  test('returns error when meta is missing', async () => {
    const submission = {}
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta" is required')
  })

  test('returns error when meta.referenceNumber is missing', async () => {
    const submission = {
      meta: {
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.referenceNumber" is required')
  })

  test('returns error when meta.formId is missing', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.formId" is required')
  })

  test('returns error when meta.versionMetadata is missing', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.versionMetadata" is required')
  })

  test('returns error when meta.versionMetadata.versionNumber is missing', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {},
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.versionMetadata.versionNumber" is required')
  })

  test('returns error when meta.timestamp is missing', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        }
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.timestamp" is required')
  })

  // ===== TYPE VALIDATION =====

  test('returns error when referenceNumber is a number instead of string', async () => {
    const submission = {
      meta: {
        referenceNumber: 123,
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.referenceNumber" must be a string')
  })

  test('returns error when formId is a number instead of string', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 456,
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.formId" must be a string')
  })

  test('returns error when versionNumber is a string instead of number', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: '1'
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.versionMetadata.versionNumber" must be a number')
  })

  test('accepts versionNumber as a float (Joi.number().strict() allows floats)', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1.5
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toEqual([])
  })

  // ===== ISO DATE VALIDATION =====

  test('returns error when timestamp is not in ISO format', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: 'not-a-date'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.timestamp" must be in iso format')
  })

  test('returns error when timestamp has invalid format with slashes', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '2024/01/01'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.timestamp" must be in iso format')
  })

  test('returns error when timestamp is in DD-MM-YYYY format', async () => {
    const submission = {
      meta: {
        referenceNumber: 'ref123',
        formId: 'form456',
        versionMetadata: {
          versionNumber: 1
        },
        timestamp: '01-01-2024'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors).toHaveLength(1)
    expect(errors[0].failure).toBe('"meta.timestamp" must be in iso format')
  })

  // ===== MULTIPLE ERRORS =====

  test('collects multiple errors when multiple validations fail', async () => {
    const submission = {
      meta: {
        referenceNumber: 123,
        formId: 456,
        versionMetadata: {
          versionNumber: '1'
        },
        timestamp: 'invalid-date'
      }
    }
    const errors = await validateRawSubmissionMeta(submission)
    expect(errors.length).toBeGreaterThan(1)
    expect(errors.map(e => e.failure)).toContain('"meta.referenceNumber" must be a string')
    expect(errors.map(e => e.failure)).toContain('"meta.formId" must be a string')
    expect(errors.map(e => e.failure)).toContain('"meta.versionMetadata.versionNumber" must be a number')
    expect(errors.map(e => e.failure)).toContain('"meta.timestamp" must be in iso format')
  })
})
