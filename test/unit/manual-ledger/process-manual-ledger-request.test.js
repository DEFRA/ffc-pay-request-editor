const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const processManualLedgerRequest = require('../../../app/manual-ledger/process-manual-ledger-request')
const getManualLedger = require('../../../app/manual-ledger/get-manual-ledger')

describe('Get manual ledger test', () => {
  let paymentRequest
  let consoleSpy

  const resetTables = async () => {
    await db.manualLedgerPaymentRequest.truncate({ cascade: true })
    await db.invoiceLine.truncate({ cascade: true })
    await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.scheme.truncate({ cascade: true })
    await db.qualityCheck.truncate({ cascade: true })
  }

  beforeAll(async () => {
    await resetTables()
    const scheme = { schemeId: 1, name: 'SFI' }
    consoleSpy = jest.spyOn(console, 'info')
    paymentRequest = paymentRequest = {
      paymentRequest: {
        paymentRequestId: 2,
        schemeId: SCHEME_ID_SFI,
        frn: 1234567890,
        value: 90000,
        invoiceNumber: 'S123456789A123456V002',
        invoiceLines: [{
          description: 'G00',
          value: 90000
        }]
      },
      paymentRequests: [{
        paymentRequestId: 2,
        schemeId: SCHEME_ID_SFI,
        frn: 1234567890,
        value: -10000,
        invoiceNumber: 'S123456789A123456V002',
        invoiceLines: [{
          description: 'G00',
          value: -10000
        }]
      }]
    }
    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 payment request record with a provisional paymaent request', async () => {
    const paymentRequestId = 1
    await processManualLedgerRequest(paymentRequest)
    const paymentRequestWithManualLedger = await getManualLedger(paymentRequestId)
    expect(paymentRequestWithManualLedger.paymentRequestId).toBe(paymentRequestId)
    expect(paymentRequestWithManualLedger.invoiceLines.length).toBe(1)
    expect(paymentRequestWithManualLedger.manualLedgerChecks.length).toBe(1)
    expect(paymentRequestWithManualLedger.manualLedgerChecks[0].ledgerPaymentRequest.paymentRequestId).toBe(2)
  })

  test('should return a duplicate payment request received found message', async () => {
    await processManualLedgerRequest(paymentRequest)
    expect(consoleSpy).toHaveBeenCalledWith(`Duplicate payment request received, skipping ${paymentRequest.paymentRequest.invoiceNumber}`)
  })

  test('should throw an error due to no invoiceNumber', async () => {
    try {
      paymentRequest.paymentRequest.invoiceNumber = undefined
      await processManualLedgerRequest(paymentRequest)
    } catch (error) {
      expect(error.message).toBeDefined()
    }
  })
})
