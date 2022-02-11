const { convertDateToDDMMYYYY } = require('../../../app/processing/convert-date')

describe('convert date', () => {
  test('converts 16/10/2020 to date', () => {
    const result = convertDateToDDMMYYYY(16, 10, 2020)
    expect(result).toEqual('16-10-2020')
  })

  test('converts 16/10/20 to date', () => {
    const result = convertDateToDDMMYYYY(16, 10, 20)
    expect(result).toEqual('16-10-20')
  })

  test('converts 6/10/2020 to padded date', () => {
    const result = convertDateToDDMMYYYY(6, 10, 2020)
    expect(result).toEqual('06-10-2020')
  })

  test('converts 16/1/2020 to padded date', () => {
    const result = convertDateToDDMMYYYY(16, 1, 2020)
    expect(result).toEqual('16-01-2020')
  })

  test('converts 6/1/2020 to padded date', () => {
    const result = convertDateToDDMMYYYY(6, 1, 2020)
    expect(result).toEqual('06-01-2020')
  })
})
