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

    scheme = { schemeId: 1, name: 'SFI' }

    paymentRequest = {
      schemeId: 1,
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
        { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', agreementNumber: 'SIP00000000000001', description: 'G00 - Gross value of claim', value: 25000 },
        { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', agreementNumber: 'SIP00000000000001', description: 'P02 - Over declaration penalty', value: -10000 }
      ]
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('should insert payment request header, invoice lines and quality check', async () => {
    await processPaymentRequest(paymentRequest)

    const pr = await db.paymentRequest.findOne({ where: { agreementNumber: 'SIP00000000000001' } })
    expect(pr.invoiceNumber).toBe(paymentRequest.invoiceNumber)
    expect(pr.contractNumber).toBe(paymentRequest.contractNumber)
    expect(parseInt(pr.frn)).toBe(paymentRequest.frn)
    expect(pr.sbi).toBe(paymentRequest.sbi)
    expect(pr.currency).toBe(paymentRequest.currency)
    expect(pr.dueDate).toBe(paymentRequest.dueDate)
    expect(pr.value).toBe(paymentRequest.value)

    const invoiceLines = await db.invoiceLine.findAll({ where: { paymentRequestId: pr.paymentRequestId } })
    expect(invoiceLines).toHaveLength(2)
    expect(invoiceLines.some(l => l.description === 'G00 - Gross value of claim')).toBe(true)
    expect(invoiceLines.some(l => l.description === 'P02 - Over declaration penalty')).toBe(true)

    const qc = await db.qualityCheck.findOne({ where: { paymentRequestId: pr.paymentRequestId } })
    expect(qc.status).toBe(NOT_READY)
  })

  test('should prevent duplicate inserts based on invoice number or referenceId', async () => {
    await processPaymentRequest(paymentRequest)
    await processPaymentRequest(paymentRequest)
    let rows = await db.paymentRequest.findAll({ where: { agreementNumber: paymentRequest.agreementNumber } })
    expect(rows.length).toBe(1)

    paymentRequest.referenceId = uuidv4()
    await processPaymentRequest(paymentRequest)
    rows = await db.paymentRequest.findAll({ where: { agreementNumber: paymentRequest.agreementNumber } })
    expect(rows.length).toBe(2)
  })

  test('should throw error for invalid payment request', async () => {
    await expect(processPaymentRequest({})).rejects.toThrow()
    const prNoLines = { ...paymentRequest }
    delete prNoLines.invoiceLines
    await expect(processPaymentRequest(prNoLines)).rejects.toThrow()
  })

  test('should overwrite existing invoice line primary key', async () => {
    paymentRequest.invoiceLines[0].paymentRequestId = 999
    await processPaymentRequest(paymentRequest)
    const pr = await db.paymentRequest.findOne()
    const invoiceLines = await db.invoiceLine.findAll({ where: { paymentRequestId: pr.paymentRequestId } })
    expect(invoiceLines.length).toBe(2)
  })
})
