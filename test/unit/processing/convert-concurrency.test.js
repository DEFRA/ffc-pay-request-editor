const {
  convertStringToPence,
  convertToPounds
} = require('../../../app/processing/conversion')

describe('Pence convertor', () => {
  test('should convert 100 to pence', () => {
    const result = convertStringToPence('100')
    expect(result).toEqual(10000)
  })

  test('should convert 100.10 to pence', () => {
    const result = convertStringToPence('100.10')
    expect(result).toEqual(10010)
  })

  test('should convert 100.1 to pence', () => {
    const result = convertStringToPence('100.1')
    expect(result).toEqual(10010)
  })

  test('should convert empty string to 0 pence', () => {
    const result = convertStringToPence('')
    expect(result).toEqual(0)
  })
})

describe('Pound convertor', () => {
  test('should convert 10000 number to pounds', () => {
    const result = convertToPounds(10000)
    expect(result).toEqual(100.00)
  })

  test('should convert 10010 number to pounds', () => {
    const result = convertToPounds(10010)
    expect(result).toEqual(100.10)
  })

  test('should convert 0 number to pounds', () => {
    const result = convertToPounds(0)
    expect(result).toEqual(0.00)
  })
})
