const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock([
  'debtData',
  'invoiceLine',
  'manualLedgerPaymentRequest',
  'paymentRequest',
  'qualityCheck',
  'scheme'
])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const checkDebts = require('../../../app/debt/check-debts')
const checkDebtsByEnrichment = require('../../../app/debt/check-debts-by-enrichment')
const saveDebtData = require('../../../app/debt/save-debt-data')
const saveProcessingDebtData = require('../../../app/processing/debt/save-debt-data').saveDebtData
const saveInvoiceLines = require('../../../app/inbound/invoice-lines')
const updateQualityCheck = require('../../../app/inbound/quality-checks')
const saveManualLedger = require('../../../app/manual-ledger/save-manual-ledger')
const getExistingPaymentRequest = require('../../../app/payment-request/get-existing-payment-request')
const savePaymentRequest = require('../../../app/payment-request/save-payment-request')
const updateQualityChecksStatus = require('../../../app/quality-check/update-quality-checks-status')
const { getSchemeId } = require('../../../app/processing/scheme/get-scheme-id')

const cases = [
  ['checkDebts', 'debtData', trx => checkDebts(1, '1234567890', 'A123', 'B456', 100, trx)],
  ['checkDebtsByEnrichment', 'debtData', trx => checkDebtsByEnrichment('1234567890', 'A123', 'B456', 100, trx)],
  ['saveDebtData (attach)', 'debtData', trx => saveDebtData({ debtDataId: 1, paymentRequestId: 2 }, trx)],
  ['saveDebtData (capture)', 'debtData', trx => saveProcessingDebtData({ frn: 1234567890 }, trx)],
  ['saveInvoiceLines', 'invoiceLine', trx => saveInvoiceLines([{ value: 1 }], 1, trx)],
  ['updateQualityCheck', 'qualityCheck', trx => updateQualityCheck(1, trx)],
  ['saveManualLedger', 'manualLedgerPaymentRequest', trx => saveManualLedger(1, 2, true, trx)],
  ['getExistingPaymentRequest', 'paymentRequest', trx => getExistingPaymentRequest('INV', undefined, 1, trx)],
  ['savePaymentRequest', 'paymentRequest', trx => savePaymentRequest({ invoiceNumber: 'INV' }, trx)],
  ['updateQualityChecksStatus', 'qualityCheck', trx => updateQualityChecksStatus(1, 'Passed', trx)],
  ['getSchemeId', 'scheme', trx => getSchemeId('SFI', trx)]
]

describe('transaction argument', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves([{ paymentRequestId: 1 }])
  })

  test.each(cases)('%s runs on the transaction when one is provided', async (_, table, run) => {
    await run(mockDb.trx)

    expect(mockDb.tables[table]).toHaveBeenCalledWith(mockDb.trx)
  })

  test.each(cases)('%s runs on the pool when no transaction is provided', async (_, table, run) => {
    await run()

    expect(mockDb.tables[table]).toHaveBeenCalledWith(undefined)
  })

  test.each(cases)('%s runs on the pool when the transaction is null', async (_, table, run) => {
    await run(null)

    expect(mockDb.tables[table]).toHaveBeenCalledWith(undefined)
  })
})

describe('column whitelisting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves([{ paymentRequestId: 1 }])
  })

  test('savePaymentRequest only inserts payment request columns and returns the new id', async () => {
    const saved = await savePaymentRequest({
      invoiceNumber: 'INV',
      invoiceLines: [{ value: 1 }],
      paymentRequests: [],
      unknownField: 'ignored'
    })

    const [row] = mockDb.builder.insert.mock.calls[0]
    expect(row.invoiceNumber).toBe('INV')
    expect(row.received).toBeInstanceOf(Date)
    expect(row).not.toHaveProperty('invoiceLines')
    expect(row).not.toHaveProperty('paymentRequests')
    expect(row).not.toHaveProperty('unknownField')
    expect(mockDb.builder.returning).toHaveBeenCalledWith('paymentRequestId')
    expect(saved).toEqual({ paymentRequestId: 1 })
  })

  test('saveInvoiceLines only inserts invoice line columns and removes the incoming primary key', async () => {
    const invoiceLines = [{ invoiceLineId: 99, value: 10, description: 'G00', unknownField: 'ignored' }]

    await saveInvoiceLines(invoiceLines, 5)

    const [[row]] = mockDb.builder.insert.mock.calls[0]
    expect(row).toMatchObject({ paymentRequestId: 5, value: 10, description: 'G00' })
    expect(row).not.toHaveProperty('invoiceLineId')
    expect(row).not.toHaveProperty('unknownField')
  })

  test('saveDebtData only inserts debt data columns', async () => {
    await saveProcessingDebtData({ frn: 1234567890, reference: 'REF', unknownField: 'ignored' })

    const [row] = mockDb.builder.insert.mock.calls[0]
    expect(row).toMatchObject({ frn: 1234567890, reference: 'REF' })
    expect(row).not.toHaveProperty('unknownField')
  })
})
