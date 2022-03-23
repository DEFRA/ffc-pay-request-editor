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
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      sbi: 123456789,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      contractNumber: 'SFIP000001',
      marketingYear: 2022,
      currency: 'GBP',
      schedule: 'M12',
      dueDate: '2021-08-15',
      value: 15000,
      invoiceLines: [
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          description: 'G00 - Gross value of claim',
          value: 25000
        },
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          description: 'P02 - Over declaration penalty',
          value: -10000
        }
      ]
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

  test('should return zero payment requests', async () => {
    const paymentRequests = await getPaymentRequest()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return a count of 0 for payment request', async () => {
    const paymentRequestCount = await getPaymentRequestCount()
    expect(paymentRequestCount).toEqual(0)
  })
})
