const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['qualityCheck'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeQualityChecks } = require('../../../app/retention/remove-quality-checks')

describe('removeQualityChecks', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes from qualityCheck within the transaction', async () => {
    await removeQualityChecks(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.qualityCheck).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool when no transaction is provided', async () => {
    await removeQualityChecks(paymentRequestIds)

    expect(mockDb.tables.qualityCheck).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
  })

  test('uses the pool when transaction is null', async () => {
    await removeQualityChecks(paymentRequestIds, null)

    expect(mockDb.tables.qualityCheck).toHaveBeenCalledWith(undefined)
  })

  test('propagates a failure', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeQualityChecks(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
