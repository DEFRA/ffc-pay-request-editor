const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const getManualLedger = require('../../../app/manual-ledger/get-manual-ledger')

describe('Get manual ledger test', () => {
  let paymentRequest
  let provisionalPaymentRequest
  let invoiceLine

  const resetTables = async () => {
    await db.manualLedgerPaymentRequest.truncate({ cascade: true })
    await db.invoiceLine.truncate({ cascade: true })
    await db.paymentRequest.truncate({ cascade: true })
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

    provisionalPaymentRequest = {
      paymentRequestId: 2,
      schemeId: SCHEME_ID_SFI,
      frn: 1234567890,
      categoryId: 3
    }

    invoiceLine = {
      description: 'G00',
      value: 1000
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create(provisionalPaymentRequest)
    await db.invoiceLine.create({ ...invoiceLine, paymentRequestId: 1 })
    await db.invoiceLine.create({ ...invoiceLine, paymentRequestId: 2 })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: true, original: true })
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 payment request record with a provisional paymaent request', async () => {
    const paymentRequestId = 1
    const paymentRequestWithManualLedger = await getManualLedger(paymentRequestId)
    expect(paymentRequestWithManualLedger.paymentRequestId).toBe(paymentRequestId)
  })

  test('should return 0 payment request record with a provisional paymaent request', async () => {
    const paymentRequestId = 3
    const paymentRequestWithManualLedger = await getManualLedger(paymentRequestId)
    expect(Object.keys(paymentRequestWithManualLedger).length).toBe(0)
  })
})
