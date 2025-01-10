const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const getManualLedgers = require('../../../app/manual-ledger/get-manual-ledgers')
const { NOT_READY, FAILED } = require('../../../app/quality-check/statuses')
const statuses = [NOT_READY, FAILED]

describe('Get manual ledgers test', () => {
  let paymentRequest
  let provisionalPaymentRequest
  let failedPaymentRequest
  let qualityCheck
  let failedQualityCheck

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

    failedPaymentRequest = {
      paymentRequestId: 3,
      schemeId: SCHEME_ID_SFI,
      frn: 1234567890,
      categoryId: 2
    }

    qualityCheck = {
      paymentRequestId: 1,
      status: NOT_READY
    }

    failedQualityCheck = {
      paymentRequestId: 3,
      status: FAILED
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create(provisionalPaymentRequest)
    await db.paymentRequest.create(failedPaymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.qualityCheck.create(failedQualityCheck)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 2 payment request records with a provisional payment request if pagination details not present', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    expect(paymentRequests.length).toBe(2)
  })

  test('should return payment request record with scheme name SFI22 if scheme name is SFI', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    expect(paymentRequests[0].schemes.name).toBe('SFI22')
  })

  test('should return paginated results correctly', async () => {
    const paymentRequestsPage1 = await getManualLedgers(statuses, 1, 1)
    const paymentRequestsPage2 = await getManualLedgers(statuses, 2, 1)

    expect(paymentRequestsPage1.length).toBe(1)
    expect(paymentRequestsPage2.length).toBe(1)

    expect(paymentRequestsPage1[0].paymentRequestId).toBe(1)
    expect(paymentRequestsPage2[0].paymentRequestId).toBe(3)
  })

  test('should return all results when usePagination is false', async () => {
    const paymentRequests = await getManualLedgers(statuses, 1, 1, false)
    expect(paymentRequests.length).toBe(2)
  })

  test('should use default page number if omitted', async () => {
    const paymentRequests = await getManualLedgers(statuses, undefined, 1, true)
    expect(paymentRequests.length).toBe(1)
    expect(paymentRequests[0].paymentRequestId).toBe(1)
  })
})
