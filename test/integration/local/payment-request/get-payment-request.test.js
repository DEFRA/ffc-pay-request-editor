const { getPaymentRequest, getPaymentRequestCount } = require('../../../../app/payment-request')
const db = require('../../../../app/data')

const resetData = async () => {
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Get payment request test', () => {
  let paymentRequest

  beforeEach(async () => {
    await resetData()

    paymentRequest = {
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      value: 15000,
      categoryId: 1,
      received: new Date()
    }

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
})
