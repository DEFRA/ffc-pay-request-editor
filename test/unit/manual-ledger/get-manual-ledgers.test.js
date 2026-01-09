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
      frn: 1234567800,
      categoryId: 2,
      marketingYear: 2023,
      agreementNumber: 'AGR001',
      invoiceNumber: 'INV001',
      paymentRequestNumber: 2,
      value: -1234567,
      received: new Date('2023-04-10').toISOString()
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

  test('should return only payment requests with categoryId 2 and matching statuses', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    expect(paymentRequests.length).toBe(2)
    const ids = paymentRequests.map(p => p.paymentRequestId)
    expect(ids).toEqual(expect.arrayContaining([1, 3]))
    expect(ids).not.toContain(2)
  })

  test('should return payment request record with schemeName "SFI22" if schemeName is "SFI"', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    for (const pr of paymentRequests) {
      expect(pr.schemeName).toBe('SFI22')
    }
  })

  test('should return paginated results correctly', async () => {
    const pageSize = 1
    const paymentRequestsPage1 = await getManualLedgers(statuses, 1, pageSize)
    const paymentRequestsPage2 = await getManualLedgers(statuses, 2, pageSize)

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

  test('should filter by frn if provided', async () => {
    const frnToFilter = '1234567800'
    const paymentRequests = await getManualLedgers(statuses, undefined, undefined, false, frnToFilter)
    expect(paymentRequests.length).toBe(1)
    expect(paymentRequests[0].paymentRequestId).toBe(1)
    expect(paymentRequests[0].frn.toString()).toBe(frnToFilter)
  })

  test('should add valueText property converted to string format', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    for (const pr of paymentRequests) {
      expect(typeof pr.valueText).toBe('string')
      expect(pr.valueText.length).toBeGreaterThan(0)
    }
  })

  test('should format received date as DD/MM/YYYY if received present', async () => {
    const paymentRequests = await getManualLedgers(statuses)
    for (const pr of paymentRequests) {
      if (pr.received) {
        expect(pr.receivedFormatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      } else {
        expect(pr.receivedFormatted).toBe('')
      }
    }
  })

  test('should correctly format received date for payment requests with received value', async () => {
    const paymentRequests = await getManualLedgers(statuses)

    const prWithReceived = paymentRequests.find(pr => pr.paymentRequestId === 1)

    expect(prWithReceived).toBeDefined()
    expect(prWithReceived.received).toBeTruthy()

    const expectedDate = new Date(prWithReceived.received).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
    expect(prWithReceived.receivedFormatted).toBe(expectedDate)
  })
})
