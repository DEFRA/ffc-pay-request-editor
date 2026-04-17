const { removeQualityChecks } = require('../../../app/retention/remove-quality-checks')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  qualityCheck: {
    destroy: jest.fn()
  }
}))

describe('removeQualityChecks', () => {
  const paymentRequestIds = [101, 102]
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.qualityCheck.destroy with correct parameters', async () => {
    await removeQualityChecks(paymentRequestIds, transaction)

    expect(db.qualityCheck.destroy).toHaveBeenCalledTimes(1)
    expect(db.qualityCheck.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction
    })
  })

  test('calls db.qualityCheck.destroy with undefined transaction if not provided', async () => {
    await removeQualityChecks(paymentRequestIds)

    expect(db.qualityCheck.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction: undefined
    })
  })

  test('propagates errors from db.qualityCheck.destroy', async () => {
    const error = new Error('DB failure')
    db.qualityCheck.destroy.mockRejectedValue(error)

    await expect(removeQualityChecks(paymentRequestIds, transaction)).rejects.toThrow('DB failure')
  })
})
