const db = require('../../../../app/data')
const { processPaymentRequest } = require('../../../../app/payment-request')
const { getInvoiceLinesOfPaymentRequest } = require('../../../../app/invoice-line')
let scheme
let paymentRequest
let paymentRequestId
describe('process payment requests', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

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

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should return invoice lines data', async () => {
    await processPaymentRequest(paymentRequest)

    const paymentRequestRows = await db.paymentRequest.findAll({
      attributes: [
        'paymentRequestId'
      ]
    })
    paymentRequestId = paymentRequestRows[0].paymentRequestId
    const invoiceLinesRows = await getInvoiceLinesOfPaymentRequest(paymentRequestId)

    expect(invoiceLinesRows[0].schemeCode).toBe('80001')
    expect(invoiceLinesRows[0].accountCode).toBe('SOS273')
    expect(invoiceLinesRows[0].fundCode).toBe('DRD10')
    expect(invoiceLinesRows[0].description).toBe('G00 - Gross value of claim')
    expect(parseFloat(invoiceLinesRows[0].value)).toBe(25000)

    expect(invoiceLinesRows[1].schemeCode).toBe('80001')
    expect(invoiceLinesRows[1].accountCode).toBe('SOS273')
    expect(invoiceLinesRows[1].fundCode).toBe('DRD10')
    expect(invoiceLinesRows[1].description).toBe('P02 - Over declaration penalty')
    expect(parseFloat(invoiceLinesRows[1].value)).toBe(-10000)
  })
})
