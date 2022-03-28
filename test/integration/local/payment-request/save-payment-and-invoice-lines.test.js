const db = require('../../../../app/data')
const { savePaymentAndInvoiceLines } = require('../../../../app/payment-request')
let paymentRequest
let categoryId

describe(' save-payment-and-invoice-lines test', () => {
  const resetData = async () => {
    await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.invoiceLine.truncate({ cascade: true })
  }

  beforeEach(async () => {
    categoryId = 1

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
        }
      ]
    }
    await resetData()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('Expect paymentRequestId to = paymentRequestResult in the database', async () => {
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const paymentRequestResult = await db.paymentRequest.findOne({ where: { paymentRequestId } })
    expect(paymentRequestResult.paymentRequestId).toBe(paymentRequestId)
  })

  test('Expect paymentRequest db to be updated to include paymentRequest frn', async () => {
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const paymentRequestResult = await db.paymentRequest.findOne({ where: { paymentRequestId } })
    expect(parseInt(paymentRequestResult.frn)).toBe(paymentRequest.frn)
  })

  test('Expect invoiceLine db to be updated to include paymentRequest.invoiceLines data', async () => {
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLinesResult = await db.invoiceLine.findOne({ where: { paymentRequestId } })
    expect(invoiceLinesResult.dataValues.value).toBe(paymentRequest.invoiceLines[0].value)
  })

  test('Expect invoiceLineResult to include paymentRequestId ', async () => {
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLinesResult = await db.invoiceLine.findOne({ where: { paymentRequestId } })
    expect(invoiceLinesResult.paymentRequestId).toBe(paymentRequestId)
  })
})
