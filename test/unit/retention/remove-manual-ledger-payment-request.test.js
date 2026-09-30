const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['manualLedgerPaymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeManualLedgerPaymentRequest } = require('../../../app/retention/remove-manual-ledger-payment-request')

describe('removeManualLedgerPaymentRequest', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes from manualLedgerPaymentRequest within the transaction', async () => {
    await removeManualLedgerPaymentRequest(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.manualLedgerPaymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool when no transaction is provided', async () => {
    await removeManualLedgerPaymentRequest(paymentRequestIds)

    expect(mockDb.tables.manualLedgerPaymentRequest).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
  })

  test('uses the pool when transaction is null', async () => {
    await removeManualLedgerPaymentRequest(paymentRequestIds, null)

    expect(mockDb.tables.manualLedgerPaymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('propagates a failure', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeManualLedgerPaymentRequest(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
