const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removePaymentRequests } = require('../../../app/retention/remove-payment-requests')

describe('removePaymentRequests', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes from paymentRequest within the transaction', async () => {
    await removePaymentRequests(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool when no transaction is provided', async () => {
    await removePaymentRequests(paymentRequestIds)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
  })

  test('uses the pool when transaction is null', async () => {
    await removePaymentRequests(paymentRequestIds, null)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('propagates a failure', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removePaymentRequests(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
