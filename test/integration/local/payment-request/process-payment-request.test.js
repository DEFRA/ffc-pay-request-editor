jest.mock('../../../../app/event', () => ({
  sendEnrichRequestBlockedEvent: () => {}
}))

const { v4: uuidv4 } = require('uuid')

const db = require('../../../../app/data')
const { processPaymentRequest } = require('../../../../app/payment-request')
const { NOT_READY } = require('../../../../app/quality-check/statuses')

let scheme
let paymentRequest

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('process payment requests', () => {
  beforeEach(async () => {
    await resetData()

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
        },
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          agreementNumber: 'SIP00000000000001',
          description: 'P02 - Over declaration penalty',
          value: -10000
        }
      ]
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('should return payment request header data', async () => {
    await processPaymentRequest(paymentRequest)
    const paymentRequestRow = await db.paymentRequest.findAll({
      where: {
        agreementNumber: 'SIP00000000000001'
      }
    })
    expect(paymentRequestRow[0].invoiceNumber).toBe('S00000001SFIP000001V001')
    expect(paymentRequestRow[0].contractNumber).toBe('SFIP000001')
    expect(parseInt(paymentRequestRow[0].frn)).toBe(1234567890)
    expect(parseInt(paymentRequestRow[0].sbi)).toBe(123456789)
    expect(paymentRequestRow[0].currency).toBe('GBP')
    expect(paymentRequestRow[0].dueDate).toBe('2015-08-15')
    expect(parseFloat(paymentRequestRow[0].value)).toBe(15000)
  })

  test('should return invoice lines data', async () => {
    await processPaymentRequest(paymentRequest)

    const invoiceLinesRows = await db.invoiceLine.findAll({
      include: [{
        model: db.paymentRequest,
        as: 'paymentRequest',
        required: true
      }]
    })

    const grossInvoiceLine = invoiceLinesRows.find(x => x.description === 'G00 - Gross value of claim' &&
      x.value === 25000 &&
      x.schemeCode === '80001' &&
      x.accountCode === 'SOS273' &&
      x.fundCode === 'DRD10')

    const penaltyInvoiceLine = invoiceLinesRows.find(x => x.description === 'P02 - Over declaration penalty' &&
      x.value === -10000 &&
      x.schemeCode === '80001' &&
      x.accountCode === 'SOS273' &&
      x.fundCode === 'DRD10')

    expect(grossInvoiceLine).toBeDefined()
    expect(penaltyInvoiceLine).toBeDefined()
  })

  test('should return quality check data', async () => {
    await processPaymentRequest(paymentRequest)

    const qualityChecksRow = await db.qualityCheck.findAll({
      include: [{
        model: db.paymentRequest,
        as: 'paymentRequest',
        required: true
      }]
    })

    expect(qualityChecksRow[0].status).toBe(NOT_READY)
  })

  test('should only insert the first payment request based on invoice number', async () => {
    await processPaymentRequest(paymentRequest)
    await processPaymentRequest(paymentRequest)

    const paymentRequestRow = await db.paymentRequest.findAll({
      where: {
        agreementNumber: 'SIP00000000000001'
      }
    })

    expect(paymentRequestRow.length).toBe(1)
  })

  test('should only insert the first payment request based on reference Id', async () => {
    paymentRequest.referenceId = uuidv4()
    await processPaymentRequest(paymentRequest)
    await processPaymentRequest(paymentRequest)

    const paymentRequestRow = await db.paymentRequest.findAll({
      where: {
        agreementNumber: 'SIP00000000000001'
      }
    })

    expect(paymentRequestRow.length).toBe(1)
  })

  test('should both payment requests if second has reference Id', async () => {
    await processPaymentRequest(paymentRequest)
    paymentRequest.referenceId = uuidv4()
    await processPaymentRequest(paymentRequest)

    const paymentRequestRow = await db.paymentRequest.findAll({
      where: {
        agreementNumber: 'SIP00000000000001'
      }
    })

    expect(paymentRequestRow.length).toBe(2)
  })

  test('should error for empty payment request', async () => {
    paymentRequest = {}

    try {
      await processPaymentRequest(paymentRequest)
    } catch (error) {
      expect(error.message).toBeDefined()
    }
  })

  test('should error for payment request without invoice lines', async () => {
    delete paymentRequest.invoiceLines

    try {
      await processPaymentRequest(paymentRequest)
    } catch (error) {
      expect(error.message).toBeDefined()
    }
  })

  test('should overwrite an existing primary key on invoice line', async () => {
    paymentRequest.invoiceLines[0].paymentRequestId = 999
    await processPaymentRequest(paymentRequest)
    const paymentRequestRow = await db.paymentRequest.findOne()
    const invoiceLinesRows = await db.invoiceLine.findAll({
      where: {
        paymentRequestId: paymentRequestRow.paymentRequestId
      }
    })

    expect(invoiceLinesRows.length).toBe(2)
  })
})
