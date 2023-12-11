const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const getManualLedgers = require('../../../app/manual-ledger/get-manual-ledgers')
const { NOT_READY, FAILED } = require('../../../app/quality-check/statuses')
const statuses = [NOT_READY, FAILED]

describe('Get manual ledgers test', () => {
  let paymentRequest
  let provisionalPaymentRequest
  let qualityCheck

  const resetTables = async () => {
    await db.qualityCheck.truncate({ cascade: true })
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

    qualityCheck = {
      paymentRequestId: 1,
      status: NOT_READY
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create(provisionalPaymentRequest)
    await db.qualityCheck.create(qualityCheck)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 payment request record with a provisional paymaent request', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    expect(paymentRequests.length).toBe(1)
  })

  test('should return 1 payment request record with scheme name SFI22 if scheme name is SFI', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    expect(paymentRequests[0].schemes.name).toBe('SFI22')
  })
})
