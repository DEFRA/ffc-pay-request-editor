const checkDebts = require('../../../../app/debt/check-debts')
const db = require('../../../../app/data')

let mockDebtData
let expectedDebtData
describe('checkDebts function', () => {
  beforeEach(async () => {
    await db.debtData.truncate({ cascade: true })
    await db.scheme.truncate({ cascade: true })
    mockDebtData = {
      debtDataId: 1,
      paymentRequestId: null,
      schemeId: 1,
      frn: '1234567890',
      reference: '123',
      netValue: '100',
      debtType: 'irr',
      recoveryDate: '20/01/2023',
      attachedDate: null,
      createdDate: '2018-02-22T11:44:06.157Z',
      createdBy: 'Developer',
      createdById: 'cx24291'
    }
    expectedDebtData = {
      debtDataId: 1,
      paymentRequestId: null,
      schemeId: 1,
      frn: '1234567890',
      reference: '123',
      netValue: '100',
      netValueText: '£1.00',
      debtType: 'irr',
      debtTypeText: 'Irregular',
      recoveryDate: '20/01/2023',
      attachedDate: null,
      createdDate: new Date('2018-02-22T11:44:06.157Z'),
      createdBy: 'Developer',
      createdById: 'cx24291'
    }
    await db.scheme.create({
      schemeId: 1,
      name: 'SFI'
    })
  })

  test('should return an empty object if frn is not a number', async () => {
    const result = await checkDebts(1, 'abc', '123', '456', 100)
    expect(result).toEqual({})
  })

  test('should return matched data if exact match of reference', async () => {
    await db.debtData.create(mockDebtData)
    const result = await checkDebts(1, '1234567890', '123', '456', 100)
    expect(result.get()).toEqual(expectedDebtData)
  })

  test('should return matched data if exact match of secondaryReference', async () => {
    await db.debtData.create(mockDebtData)
    const result = await checkDebts(1, '1234567890', '456', '123', 100)
    expect(result.get()).toEqual(expectedDebtData)
  })

  test('should return matched data if numeric part of reference matches', async () => {
    await db.debtData.create(mockDebtData)
    const result = await checkDebts(1, '1234567890', 'A0123A', 'B0456B', 100)
    expect(result.get()).toEqual(expectedDebtData)
  })

  test('should return matched data if numeric part of secondary reference matches', async () => {
    await db.debtData.create(mockDebtData)
    const result = await checkDebts(1, '1234567890', 'B0456B', 'A0123A', 100)
    expect(result.get()).toEqual(expectedDebtData)
  })

  test('should return null if no match', async () => {
    const result = await checkDebts(1, '1234567890', 'A0123A', '456B', 100)
    expect(result).toEqual(null)
  })
})
