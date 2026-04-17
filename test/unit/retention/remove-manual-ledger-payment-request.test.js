const { removeManualLedgerPaymentRequest } = require('../../../app/retention/remove-manual-ledger-payment-request')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  manualLedgerPaymentRequest: {
    destroy: jest.fn()
  }
}))

describe('removeManualLedgerPaymentRequest', () => {
  const paymentRequestIds = [101, 102]
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.manualLedgerPaymentRequest.destroy with correct parameters', async () => {
    await removeManualLedgerPaymentRequest(paymentRequestIds, transaction)

    expect(db.manualLedgerPaymentRequest.destroy).toHaveBeenCalledTimes(1)
    expect(db.manualLedgerPaymentRequest.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction
    })
  })

  test('calls db.manualLedgerPaymentRequest.destroy with undefined transaction if not provided', async () => {
    await removeManualLedgerPaymentRequest(paymentRequestIds)

    expect(db.manualLedgerPaymentRequest.destroy).toHaveBeenCalledWith({
      where: { paymentRequestId: paymentRequestIds },
      transaction: undefined
    })
  })

  test('propagates errors from db.manualLedgerPaymentRequest.destroy', async () => {
    const error = new Error('DB failure')
    db.manualLedgerPaymentRequest.destroy.mockRejectedValue(error)

    await expect(removeManualLedgerPaymentRequest(paymentRequestIds, transaction)).rejects.toThrow('DB failure')
  })
})
