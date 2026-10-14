const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const resetManualLedger = require('../../../app/manual-ledger/reset-manual-ledger')

describe('Get manual ledger test', () => {
  let paymentRequest

  const resetTables = async () => {
    await truncate(['manualLedgerPaymentRequest'])
    await truncate(['paymentRequests'])
    await truncate(['schemes'])
  }

  beforeEach(async () => {
    await resetTables()
    const scheme = { schemeId: 1, name: 'SFI' }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI,
      frn: 1234567890,
      categoryId: 2
    }

    await db.scheme().insert(scheme)
    await db.paymentRequest().insert(paymentRequest)
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 2 })
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 3 })
    await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: false, original: true })
    await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 1, ledgerPaymentRequestId: 3, active: true, original: false })
  })

  afterAll(async () => {
    await resetTables()
    await db.close()
  })

  test('should return 1 payment request record with a provisional payment request', async () => {
    const paymentRequestId = 1
    await resetManualLedger(paymentRequestId)
    const manualLedgerPaymentRequest = await db.manualLedgerPaymentRequest()
    expect(manualLedgerPaymentRequest.length).toBe(1)
    expect(manualLedgerPaymentRequest[0].active).toBe(true)
  })

  test('should return an error', async () => {
    try {
      const paymentRequestId = null
      await resetManualLedger(paymentRequestId)
    } catch (error) {
      expect(error.message).toBeDefined()
    }
  })
})
