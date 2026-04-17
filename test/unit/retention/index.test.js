const { removeAgreementData } = require('../../../app/retention')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  sequelize: {
    transaction: jest.fn()
  }
}))

jest.mock('../../../app/retention/find-payment-requests', () => ({
  findPaymentRequests: jest.fn()
}))
jest.mock('../../../app/retention/remove-debt-data', () => ({
  removeDebtData: jest.fn()
}))
jest.mock('../../../app/retention/remove-quality-checks', () => ({
  removeQualityChecks: jest.fn()
}))
jest.mock('../../../app/retention/remove-manual-ledger-payment-request', () => ({
  removeManualLedgerPaymentRequest: jest.fn()
}))
jest.mock('../../../app/retention/remove-invoice-lines', () => ({
  removeInvoiceLines: jest.fn()
}))
jest.mock('../../../app/retention/remove-payment-requests', () => ({
  removePaymentRequests: jest.fn()
}))

const {
  findPaymentRequests
} = require('../../../app/retention/find-payment-requests')
const {
  removeDebtData
} = require('../../../app/retention/remove-debt-data')
const {
  removeManualLedgerPaymentRequest
} = require('../../../app/retention/remove-manual-ledger-payment-request')
const {
  removeInvoiceLines
} = require('../../../app/retention/remove-invoice-lines')
const {
  removePaymentRequests
} = require('../../../app/retention/remove-payment-requests')
const { removeQualityChecks } = require('../../../app/retention/remove-quality-checks')

describe('removeAgreementData', () => {
  const retentionData = {
    agreementNumber: 'AGR123',
    frn: 456789,
    schemeId: 10
  }
  let transaction

  beforeEach(() => {
    jest.clearAllMocks()

    transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }
    db.sequelize.transaction.mockResolvedValue(transaction)
  })

  test('commits transaction and returns early if no payment requests found', async () => {
    findPaymentRequests.mockResolvedValue([])

    await removeAgreementData(retentionData)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(findPaymentRequests).toHaveBeenCalledWith(
      retentionData.agreementNumber,
      retentionData.frn,
      retentionData.schemeId,
      transaction
    )
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('removes payment requests and related data when paymentRequestIds exist', async () => {
    const paymentRequests = [
      { paymentRequestId: 1 },
      { paymentRequestId: 2 }
    ]

    findPaymentRequests.mockResolvedValue(paymentRequests)
    removeDebtData.mockResolvedValue()
    removeQualityChecks.mockResolvedValue()
    removeManualLedgerPaymentRequest.mockResolvedValue()
    removeInvoiceLines.mockResolvedValue()
    removePaymentRequests.mockResolvedValue()

    await removeAgreementData(retentionData)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(findPaymentRequests).toHaveBeenCalledWith(
      retentionData.agreementNumber,
      retentionData.frn,
      retentionData.schemeId,
      transaction
    )
    expect(removeDebtData).toHaveBeenCalledWith(
      [1, 2],
      transaction
    )
    expect(removeQualityChecks).toHaveBeenCalledWith(
      [1, 2],
      transaction
    )
    expect(removeManualLedgerPaymentRequest).toHaveBeenCalledWith(
      [1, 2],
      transaction
    )
    expect(removeInvoiceLines).toHaveBeenCalledWith(
      [1, 2],
      transaction
    )
    expect(removePaymentRequests).toHaveBeenCalledWith(
      [1, 2],
      transaction
    )
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if any step fails', async () => {
    const error = new Error('Something went wrong')
    removeDebtData.mockRejectedValue(error)

    await expect(removeAgreementData(retentionData)).rejects.toThrow('Something went wrong')
    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })
})
