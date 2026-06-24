const schema = require('../../../../app/routes/schemas/enrich-request')
const { ADMINISTRATIVE, IRREGULAR } = require('../../../../app/constants/debt-types')

describe('enrich-request schema', () => {
  test('valid payload passes validation', () => {
    const payload = {
      day: 1,
      month: 1,
      year: 2015,
      'debt-type': ADMINISTRATIVE,
      'invoice-number': 'INV-001',
      'payment-request-id': 1
    }
    const { error } = schema.validate(payload)
    expect(error).toBeUndefined()
  })

  test('missing required fields fail', () => {
    const payload = {}
    const { error } = schema.validate(payload)
    expect(error).toBeDefined()
    expect(error.details.length).toBeGreaterThanOrEqual(1)
  })

  test.each([
    [{ day: 0, field: 'day' }, 'day out of range'],
    [{ day: 32, field: 'day' }, 'day out of range high'],
    [{ month: 0, field: 'month' }, 'month out of range'],
    [{ month: 13, field: 'month' }, 'month out of range high'],
    [{ year: 2014, field: 'year' }, 'year too small'],
    [{ 'payment-request-id': 1.5, field: 'payment-request-id' }, 'payment request id not integer']
  ])('invalid numeric values: %s (%s)', (caseData) => {
    const valid = {
      day: 1,
      month: 1,
      year: 2015,
      'debt-type': ADMINISTRATIVE,
      'invoice-number': 'INV-001',
      'payment-request-id': 1
    }
    const payload = { ...valid, ...caseData }
    const { error } = schema.validate(payload)
    expect(error).toBeDefined()
  })

  test('invalid debt-type is rejected', () => {
    const payload = {
      day: 1,
      month: 1,
      year: 2015,
      'debt-type': 'BANANA',
      'invoice-number': 'INV-001',
      'payment-request-id': 1
    }
    const { error } = schema.validate(payload)
    expect(error).toBeDefined()
  })

  test('both allowed debt-types are accepted', () => {
    const base = {
      day: 1,
      month: 1,
      year: 2015,
      'invoice-number': 'INV-002',
      'payment-request-id': 2
    }

    const a = { ...base, 'debt-type': ADMINISTRATIVE }
    const b = { ...base, 'debt-type': IRREGULAR }

    expect(schema.validate(a).error).toBeUndefined()
    expect(schema.validate(b).error).toBeUndefined()
  })

  test('invoice-number is required', () => {
    const payload = {
      day: 1,
      month: 1,
      year: 2015,
      'debt-type': ADMINISTRATIVE,
      'payment-request-id': 1
    }
    const { error } = schema.validate(payload)
    expect(error).toBeDefined()
  })
})
