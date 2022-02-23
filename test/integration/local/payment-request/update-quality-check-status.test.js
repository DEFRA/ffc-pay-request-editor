const db = require('../../../../app/data')
const { processPaymentRequest } = require('../../../../app/payment-request')
const { updateQualityChecksStatus } = require('../../../../app/quality-check')
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

  test('confirm quality data status update', async () => {
    await processPaymentRequest(paymentRequest)

    const qualityChecksRowBeforeUpade = await db.qualityCheck.findAll({
      include: [{
        model: db.paymentRequest,
        as: 'paymentRequest',
        required: true
      }]
    })

    paymentRequestId = qualityChecksRowBeforeUpade[0].paymentRequestId

    expect(qualityChecksRowBeforeUpade[0].status).toBe('Pending')

    await updateQualityChecksStatus(paymentRequestId, 'Passed')

    const qualityChecksRowAfterUpade = await db.qualityCheck.findAll({
      where: { paymentRequestId: paymentRequestId },
      include: [{
        model: db.paymentRequest,
        as: 'paymentRequest',
        required: true
      }]
    })
    expect(qualityChecksRowAfterUpade[0].status).toBe('Passed')
  })
})
