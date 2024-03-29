const {
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR,
  IRREGULAR_TEXT
} = require('../../../app/constants/debt-types')
const { convertDebtIdToText } = require('../../../app/processing/conversion')

describe('Debt type convertor', () => {
  test('converts "adm" to "Administrative"', () => {
    const result = convertDebtIdToText(ADMINISTRATIVE)
    expect(result).toEqual(ADMINISTRATIVE_TEXT)
  })

  test('converts "irr" to "Irregular"', () => {
    const result = convertDebtIdToText(IRREGULAR)
    expect(result).toEqual(IRREGULAR_TEXT)
  })

  test('converts "notRealDebtType" to ""', () => {
    const result = convertDebtIdToText('notRealDebtType')
    expect(result).toEqual('')
  })
})
