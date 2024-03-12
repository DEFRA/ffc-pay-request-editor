const checkDebts = require('../../../../app/debt/check-debts')
const db = require('../../../../app/data')

db.debtData.findOne = jest.fn()

const mockTransaction = {}

describe('checkDebts function', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return an empty object if frn is not a number', async () => {
    const result = await checkDebts(1, 'abc', '123A', 100, mockTransaction)
    expect(result).toEqual({})
  })

  test('should return matched data if numeric part of reference matches', async () => {
    const mockMatchedData = { schemeId: 1, frn: 123, reference: '456A', netValue: 100 }
    db.debtData.findOne.mockResolvedValueOnce(mockMatchedData)
    const result = await checkDebts(1, '123', 'A0123', 100, mockTransaction)
    expect(result).toEqual(mockMatchedData)
    expect(db.debtData.findOne).toHaveBeenCalledWith({
      transaction: mockTransaction,
      where: {
        schemeId: 1,
        frn: 123,
        netValue: 100,
        paymentRequestId: null,
        reference: {
          [db.Sequelize.Op.like]: '%0123'
        }
      }
    })
  })
})
