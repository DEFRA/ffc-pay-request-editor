const { convertDateToDDMMYYYY } = require('../../../app/processing/conversion')

describe('Date converter', () => {
  test.each([
    [16, 10, 2020, '16/10/2020'],
    [16, 10, 20, '16/10/20'],
    [6, 10, 2020, '06/10/2020'],
    [16, 1, 2020, '16/01/2020'],
    [6, 1, 2020, '06/01/2020']
  ])('converts %i/%i/%i to %s', (day, month, year, expected) => {
    expect(convertDateToDDMMYYYY(day, month, year)).toEqual(expected)
  })
})
