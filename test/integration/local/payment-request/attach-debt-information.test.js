const db = require('../../../../app/data')
const { attachDebtInformation } = require('../../../../app/debt')
// const { processPaymentRequest } = require('../../../../app/payment-request')
let paymentRequest
let paymentRequestId
let debtData
let qualityData
describe('process payment requests', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    // define the db tables to be used in testing

    qualityData = {
      qualityCheckId: 1,
      checkedDate: null,
      checkedBy: null,
      status: 'Not ready'
    }

    debtData = {
      debtDataId: 1,
      schemeId: null,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 150,
      debtType: null,
      recoveryDate: null,
      attachedDate: null,
      createdDate: null
    }

    paymentRequest = {
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      sbi: 123456789,
      paymentRequestNumber: 40,
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

    await db.debtData.create(debtData)
    await db.qualityCheck.create(qualityData)
    paymentRequestId = 39
    // await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('Update the debtData table with data from the payment request', async () => {
    const debtDataRow = await db.debtData.findAll({
    })
    console.log(debtDataRow)
    await attachDebtInformation(paymentRequest, paymentRequestId)
    expect(debtDataRow[0].paymentRequestId).toBe(paymentRequestId)
    // check date is not null
    // include quality table test as well
  })
})
