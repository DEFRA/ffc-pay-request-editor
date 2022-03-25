const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const resetManualLedger = require('../../../app/manual-ledger/reset-manual-ledger')

describe('Get manual ledger test', () => {
  let paymentRequest

  const resetTables = async () => {
    await db.manualLedgerPaymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.scheme.truncate({ cascade: true })
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

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 2 })
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 3 })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: false, original: true })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 1, ledgerPaymentRequestId: 3, active: true, original: false })
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 payment request record with a provisional paymaent request', async () => {
    const paymentRequestId = 1
    await resetManualLedger(paymentRequestId)
    const manualLedgerPaymentRequest = await db.manualLedgerPaymentRequest.findAll()
    console.log(manualLedgerPaymentRequest)
    expect(manualLedgerPaymentRequest.length).toBe(1)
    expect(manualLedgerPaymentRequest[0].active).toBe(true)
  })
})
