const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { findPaymentRequests } = require('../../../app/retention/find-payment-requests')

describe('findPaymentRequests', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves([])
  })

  test('filters on agreementNumber when usesContractNumber is false', async () => {
    const mockResult = [{ paymentRequestId: 201 }, { paymentRequestId: 202 }]
    mockDb.builder.resolves(mockResult)

    const result = await findPaymentRequests(agreementNumber, frn, schemeId, false, mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.select).toHaveBeenCalledWith('paymentRequestId')
    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId })
    expect(result).toBe(mockResult)
  })

  test('filters on contractNumber when usesContractNumber is true', async () => {
    const mockResult = [{ paymentRequestId: 301 }]
    mockDb.builder.resolves(mockResult)

    const result = await findPaymentRequests(agreementNumber, frn, schemeId, true, mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ contractNumber: agreementNumber, frn, schemeId })
    expect(result).toBe(mockResult)
  })

  test('uses the pool when no transaction is provided', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, false)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('uses the pool when transaction is null', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, true, null)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('propagates a failure', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(findPaymentRequests(agreementNumber, frn, schemeId, false, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
