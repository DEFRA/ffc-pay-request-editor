const checkDebts = require('../../../../app/debt/check-debts')
const db = require('../../../../app/data')
const { mockDebt2, expectedDebt } = require('../../../mocks/debt-information')

describe('checkDebts', () => {
  beforeEach(async () => {
    await db.debtData.truncate({ cascade: true })
    await db.scheme.truncate({ cascade: true })
    await db.scheme.create({ schemeId: 1, name: 'SFI' })
  })

  test('returns {} when frn is not numeric', async () => {
    const result = await checkDebts(1, 'abc', '123', '456', 100)
    expect(result).toEqual({})
  })

  describe('matching', () => {
    beforeEach(async () => {
      await db.debtData.create(mockDebt2)
    })

    test.each([
      ['exact reference', '123', '456'],
      ['exact secondary reference', '456', '123'],
      ['numeric ref match', 'A0123A', 'B0456B'],
      ['numeric secondary ref match', 'B0456B', 'A0123A']
    ])('returns expectedDebt when %s matches', async (_, reference, secondaryReference) => {
      const result = await checkDebts(1, '1234567890', reference, secondaryReference, 100)
      expect(result.get()).toEqual(expectedDebt)
    })
  })

  test('returns null when no match found', async () => {
    const result = await checkDebts(1, '1234567890', 'A0123A', '456B', 100)
    expect(result).toEqual(null)
  })
})
