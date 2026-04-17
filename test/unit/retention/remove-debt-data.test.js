const { removeDebtData } = require('../../../app/retention/remove-debt-data')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  debtData: {
    destroy: jest.fn()
  }
}))

describe('removeDebtData', () => {
  const paymentRequestIds = [101, 102]
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.debtData.destroy with correct parameters', async () => {
    await removeDebtData(paymentRequestIds, transaction)

    expect(db.debtData.destroy).toHaveBeenCalledTimes(1)
    expect(db.debtData.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction
    })
  })

  test('calls db.debtData.destroy with undefined transaction if not provided', async () => {
    await removeDebtData(paymentRequestIds)

    expect(db.debtData.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction: undefined
    })
  })

  test('propagates errors from db.debtData.destroy', async () => {
    const error = new Error('DB failure')
    db.debtData.destroy.mockRejectedValue(error)

    await expect(removeDebtData(paymentRequestIds, transaction)).rejects.toThrow('DB failure')
  })
})
