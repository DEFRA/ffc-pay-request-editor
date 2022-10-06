const objectCheck = require('../../../app/processing/object-check')

describe('object check', () => {
  test('getObjectKey returns key', () => {
    const result = objectCheck.getObjectKey({ a: 'b' }, 'a')
    expect(result).toBe('b')
  })

  test('getObjectKey returns default key if key does not exist', () => {
    const result = objectCheck.getObjectKey({ e: 'b' }, 'a', 'c')
    expect(result).toBe('c')
  })

  test('getObjectKeyEquals returns true if key exists and equals value', () => {
    const result = objectCheck.getObjectKeyEquals({ a: 'b' }, 'a', 'b')
    expect(result).toBe(true)
  })

  test('getObjectKeyEquals returns false if key exists and does not equal value', () => {
    const result = objectCheck.getObjectKeyEquals({ a: 'b' }, 'a', 'c')
    expect(result).toBe(false)
  })

  test('getObjectKeyEquals returns default if object undefined', () => {
    const result = objectCheck.getObjectKeyEquals(undefined, 'a', 'c')
    expect(result).toBe(false)
  })
})
