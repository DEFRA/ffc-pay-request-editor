const db = require('../../../app/data')
const { getPaymentRequest } = require('../../../app/payment-request')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('../../../app/payment-request/categories')
const { AP } = require('../../../app/processing/ledger/ledgers')

describe('Payment Request Functions Test Suite', () => {
  let paymentRequest1
  let paymentRequest2
  let scheme

  const resetTables = async () => {
    await db.debtData.truncate({ cascade: true })
    await db.paymentRequest.truncate({ cascade: true })
    await db.scheme.truncate({ cascade: true })
  }

  beforeEach(async () => {
    await resetTables()
    scheme = { schemeId: 1, name: 'SFI' }
    paymentRequest1 = {
      paymentRequestId: 1,
      schemeId: scheme.schemeId,
      frn: 1234567890,
      categoryId: ENRICHMENT,
      agreementNumber: 'AG123',
      invoiceNumber: 'INV123',
      paymentRequestNumber: 2,
      value: 1000,
      received: new Date('2022-12-09'),
      ledger: AP,
      marketingYear: 2023,
      daysWaiting: 10,
      netValue: -500
    }

    paymentRequest2 = {
      paymentRequestId: 2,
      schemeId: scheme.schemeId,
      frn: 9876543210,
      categoryId: LEDGER_ENRICHMENT,
      agreementNumber: 'AG124',
      invoiceNumber: 'INV124',
      paymentRequestNumber: 3,
      value: 1800,
      received: new Date(),
      ledger: AP,
      marketingYear: 2023,
      daysWaiting: 15,
      netValue: -200
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest1)
    await db.paymentRequest.create(paymentRequest2)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return paginated results correctly', async () => {
    const paymentRequestsPage1 = await getPaymentRequest(1, 1)
    const paymentRequestsPage2 = await getPaymentRequest(2, 1)

    expect(paymentRequestsPage1.length).toBe(1)
    expect(paymentRequestsPage2.length).toBe(1)

    expect(paymentRequestsPage1[0].paymentRequestId).toBe(1)
    expect(paymentRequestsPage2[0].paymentRequestId).toBe(2)
  })

  test('should return all results when usePagination is false', async () => {
    const paymentRequests = await getPaymentRequest(1, 1, false)
    expect(paymentRequests.length).toBe(2)
  })

  test('should use default page number if omitted', async () => {
    const paymentRequests = await getPaymentRequest(undefined, 1, true)
    expect(paymentRequests.length).toBe(1)
    expect(paymentRequests[0].paymentRequestId).toBe(1)
  })
})
