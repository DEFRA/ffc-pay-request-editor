const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')

jest.mock('../../../../app/event', () => ({
  sendEnrichRequestBlockedEvent: () => {}
}))

const { processPaymentRequest } = require('../../../../app/payment-request')
const { updateQualityChecksStatus } = require('../../../../app/quality-check')
const { NOT_READY, PASSED } = require('../../../../app/quality-check/statuses')

let scheme
let paymentRequest
let paymentRequestId

const resetData = async () => {
  await truncate(['qualityChecks'])
  await truncate(['schemes'])
  await truncate(['debtData'])
  await truncate(['paymentRequests'])
}

describe('process payment requests', () => {
  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

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

    await db.scheme().insert(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.close()
  })

  test('confirm quality data status update', async () => {
    await processPaymentRequest(paymentRequest)

    const qualityChecksRowBeforeUpdate = await db.qualityCheck()

    paymentRequestId = qualityChecksRowBeforeUpdate[0].paymentRequestId

    expect(qualityChecksRowBeforeUpdate[0].status).toBe(NOT_READY)

    await updateQualityChecksStatus(paymentRequestId, PASSED)

    const qualityChecksRowAfterUpdate = await db.qualityCheck().where({ paymentRequestId })
    expect(qualityChecksRowAfterUpdate[0].status).toBe(PASSED)
  })
})
