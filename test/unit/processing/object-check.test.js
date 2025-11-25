const objectCheck = require('../../../app/processing/object-check')

describe('object check', () => {
  describe('getObjectKey', () => {
    test.each([
      [{ a: 'b' }, 'a', undefined, 'b'],
      [{ e: 'b' }, 'a', 'c', 'c']
    ])('getObjectKey(%o, %s, %s) => %s', (obj, key, defaultValue, expected) => {
      expect(objectCheck.getObjectKey(obj, key, defaultValue)).toBe(expected)
    })
  })

  describe('getObjectKeyEquals', () => {
    test.each([
      [{ a: 'b' }, 'a', 'b', true],
      [{ a: 'b' }, 'a', 'c', false],
      [undefined, 'a', 'c', false]
    ])('getObjectKeyEquals(%o, %s, %s) => %s', (obj, key, value, expected) => {
      expect(objectCheck.getObjectKeyEquals(obj, key, value)).toBe(expected)
    })
  })
})
