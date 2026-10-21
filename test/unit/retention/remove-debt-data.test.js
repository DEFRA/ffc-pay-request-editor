const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['debtData'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeDebtData } = require('../../../app/retention/remove-debt-data')

describe('removeDebtData', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes from debtData within the transaction', async () => {
    await removeDebtData(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.debtData).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool when no transaction is provided', async () => {
    await removeDebtData(paymentRequestIds)

    expect(mockDb.tables.debtData).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
  })

  test('uses the pool when transaction is null', async () => {
    await removeDebtData(paymentRequestIds, null)

    expect(mockDb.tables.debtData).toHaveBeenCalledWith(undefined)
  })

  test('propagates a failure', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeDebtData(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
