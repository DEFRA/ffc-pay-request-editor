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
      dueDate: '2015-08-15',
      value: 15000,
      invoiceLines: [
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          agreementNumber: 'SIP00000000000001',
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

  test('Expect invoice line to save scheme code', async () => {
    await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLine = await db.invoiceLine.findOne({
      where: {
        schemeCode: '80001'
      }
    })
    expect(invoiceLine.schemeCode).toBeDefined()
  })

  test('Expect invoice line to save with payment request Id', async () => {
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLine = await db.invoiceLine.findOne({
      where: {
        schemeCode: '80001'
      }
    })
    expect(invoiceLine.paymentRequestId).toBe(paymentRequestId)
  })

  test('Expect invoice line to save with payment request Id even if invoice line has payment Request Id', async () => {
    paymentRequest.invoiceLines[0].paymentRequestId = 2
    const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLine = await db.invoiceLine.findOne({
      where: {
        schemeCode: '80001'
      }
    })
    expect(invoiceLine.paymentRequestId).toBe(paymentRequestId)
  })

  test('Expect invoice line to save with agreement number if present', async () => {
    await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLine = await db.invoiceLine.findOne({
      where: {
        schemeCode: '80001'
      }
    })
    expect(invoiceLine.agreementNumber).toBe('SIP00000000000001')
  })

  test('Expect invoice line to save without agreement number if not present', async () => {
    delete paymentRequest.invoiceLines[0].agreementNumber
    await savePaymentAndInvoiceLines(paymentRequest, categoryId)
    const invoiceLine = await db.invoiceLine.findOne({
      where: {
        schemeCode: '80001'
      }
    })
    expect(invoiceLine.agreementNumber).toBeNull()
  })
})
