const db = require('../../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { DEBT_TYPE_IRREGULAR } = require('../../../data/debt-types')

describe('Get released payment request test', () => {
  let paymentRequest
  let debtData
  let invoiceLine

  beforeEach(async () => {
    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    debtData = {
      paymentRequestId: 1,
      debtType: DEBT_TYPE_IRREGULAR
    }

    invoiceLine = {
      paymentRequestId: 1,
      value: 10000
    }

    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create(paymentRequest)
    await db.debtData.truncate({ cascade: true })
    await db.debtData.create(debtData)
    await db.invoiceLine.truncate({ cascade: true })
    await db.invoiceLine.create(invoiceLine)
  })

  test('should return 1 payment request record when released is null', async () => {
    const completedQualityChecks = await getQualityCheckedPaymentRequests()
    expect(completedQualityChecks).toHaveLength(1)
  })

  test('should return 0 payment request record when no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const completedQualityChecks = await getQualityCheckedPaymentRequests()
    expect(completedQualityChecks).toHaveLength(0)
  })

  test('should return 0 payment request record when released is not null', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create({ ...paymentRequest, released: new Date() })
    const completedQualityChecks = await getQualityCheckedPaymentRequests()
    expect(completedQualityChecks).toHaveLength(0)
  })
})
