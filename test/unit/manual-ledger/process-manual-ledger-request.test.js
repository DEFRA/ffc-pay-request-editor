const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const processManualLedgerRequest = require('../../../app/manual-ledger/process-manual-ledger-request')
const getManualLedger = require('../../../app/manual-ledger/get-manual-ledger')

describe('Get manual ledger test', () => {
  let paymentRequest
  let consoleSpy

  const resetTables = async () => {
    await truncate(['manualLedgerPaymentRequest'])
    await truncate(['invoiceLines'])
    await truncate(['paymentRequests'])
    await truncate(['schemes'])
    await truncate(['qualityChecks'])
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
        }],
        netValue: 4000
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
    await db.scheme().insert(scheme)
  })

  afterAll(async () => {
    await resetTables()
    await db.close()
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

  test('confirm payload with paymentRequest.netValue is added to database and can be retrieved ', async () => {
    const paymentRequestId = 1
    await processManualLedgerRequest(paymentRequest)
    const paymentRequestWithManualLedger = await getManualLedger(paymentRequestId)
    expect(paymentRequestWithManualLedger.netValue).not.toBe(null)
    expect(paymentRequestWithManualLedger.netValue).not.toBe(40.00)
    expect(paymentRequestWithManualLedger.netValue).toBe(4000)
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
