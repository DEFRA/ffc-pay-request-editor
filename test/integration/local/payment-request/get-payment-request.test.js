const db = require('../../../../app/data')

const { SFI, CS } = require('../../../../app/constants/schemes')

const { getPaymentRequest, getPaymentRequestCount, getPaymentRequestAwaitingEnrichment } = require('../../../../app/payment-request')

const resetData = async () => {
  await db.scheme.truncate({ cascade: true, restartIdentity: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

let paymentRequest
let scheme

describe('Get payment request test', () => {
  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: SFI,
      name: 'SFI'
    }

    paymentRequest = {
      schemeId: SFI,
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      contractNumber: 'A1234567',
      value: 15000,
      categoryId: 1,
      received: new Date()
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('should return 1 payment request record', async () => {
    const paymentRequests = await getPaymentRequest()
    expect(paymentRequests).toHaveLength(1)
  })

  test('should return a count of 1 for payment request', async () => {
    const paymentRequestCount = await getPaymentRequestCount()
    expect(paymentRequestCount).toEqual(1)
  })

  test('should return zero payment requests with categoryId 2', async () => {
    const categoryId = 2
    const paymentRequests = await getPaymentRequest(categoryId)
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return a count of 0 for payment request with categoryId 2', async () => {
    const categoryId = 2
    const paymentRequestCount = await getPaymentRequestCount(categoryId)
    expect(paymentRequestCount).toEqual(0)
  })

  test('should create a receivedFormatted virtual type when paymentRequest has a received value', async () => {
    const paymentRequests = await getPaymentRequest()
    expect(typeof paymentRequests[0].receivedFormatted).toBe('string')
    expect(paymentRequests[0].receivedFormatted).not.toBe(null)
    expect(paymentRequests[0].receivedFormatted).toBe(paymentRequests[0].received.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }))
  })

  test('daysWaiting virtual type should return the number of days since the "received" date', async () => {
    const mockDateNow = new Date('2022-02-01')
    Date.now = jest.fn().mockReturnValue(mockDateNow)
    paymentRequest.received = '2022-01-01'
    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    const daysWaiting = (Math.round((mockDateNow - new Date(paymentRequest.received)) / (1000 * 60 * 60 * 24)))
    const paymentRequests = await getPaymentRequest()
    expect(paymentRequests[0].daysWaiting).toBe(daysWaiting)
    expect(paymentRequests[0].daysWaiting).not.toBe(null)
    expect(typeof paymentRequests[0].daysWaiting).toBe('number')
  })

  test('daysWaiting virtual type should return "" when paymentRequest has no "received" value', async () => {
    paymentRequest.received = undefined
    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    const paymentRequests = await getPaymentRequest()
    expect(paymentRequests[0].daysWaiting).toBe('')
  })

  test('records should be returned ordered by "received" in ascending order', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const paymentRequests = [{
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567891,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      value: 15000,
      categoryId: 1,
      received: '2022-04-01'
    },
    {
      invoiceNumber: 'S00000001SFIP000001V002',
      frn: 1234567890,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000002',
      value: 12000,
      categoryId: 1,
      received: '2022-01-01'
    }]
    await db.paymentRequest.bulkCreate(paymentRequests)
    const paymentRequestRows = await getPaymentRequest()
    expect(paymentRequestRows[0].received).toStrictEqual(new Date('2022-01-01T00:00:00.000Z'))
    expect(paymentRequestRows[1].received).toStrictEqual(new Date('2022-04-01T00:00:00.000Z'))
  })

  test('get payment request for enrichment should match by agreement number if not CS', async () => {
    const matchedPaymentRequest = await getPaymentRequestAwaitingEnrichment(paymentRequest.schemeId, paymentRequest.frn, paymentRequest.agreementNumber, paymentRequest.value, paymentRequest.categoryId)
    expect(matchedPaymentRequest.agreementNumber).toBe(paymentRequest.agreementNumber)
  })

  test('get payment request for enrichment should match by contract number if CS', async () => {
    scheme.schemeId = CS
    paymentRequest.schemeId = CS
    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    const matchedPaymentRequest = await getPaymentRequestAwaitingEnrichment(paymentRequest.schemeId, paymentRequest.frn, paymentRequest.contractNumber, paymentRequest.value, paymentRequest.categoryId)
    expect(matchedPaymentRequest.contractNumber).toBe(paymentRequest.contractNumber)
  })

  test('get payment request for enrichment should match by contract number if CS and current contract has leading 0 prefix', async () => {
    scheme.schemeId = CS
    paymentRequest.schemeId = CS
    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    paymentRequest.contractNumber = 'A01234567'
    const matchedPaymentRequest = await getPaymentRequestAwaitingEnrichment(paymentRequest.schemeId, paymentRequest.frn, paymentRequest.contractNumber, paymentRequest.value, paymentRequest.categoryId)
    expect(matchedPaymentRequest.contractNumber).toBe('A1234567')
  })

  test('get payment request for enrichment should match by contract number if CS and previous contract has leading 0 prefix', async () => {
    scheme.schemeId = CS
    paymentRequest.schemeId = CS
    paymentRequest.contractNumber = 'A01234567'
    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    paymentRequest.contractNumber = 'A1234567'
    const matchedPaymentRequest = await getPaymentRequestAwaitingEnrichment(paymentRequest.schemeId, paymentRequest.frn, paymentRequest.contractNumber, paymentRequest.value, paymentRequest.categoryId)
    expect(matchedPaymentRequest.contractNumber).toBe('A01234567')
  })
})
