const db = require('../../../../app/data')
const { getCompletedQualityCheckRequests } = require('../../../../app/quality-check')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { DEBT_TYPE_IRREGULAR } = require('../../../data/debt-types')

describe('Get completed quality checks test', () => {
  let paymentRequest
  let debtData
  let invoiceLine

  beforeEach(async () => {
    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: new Date()
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

  test('should return 1 completed quality check record when released is not null', async () => {
    const completedQualityChecks = await getCompletedQualityCheckRequests()
    expect(completedQualityChecks).toHaveLength(1)
  })

  test('should return zero completed quality check records when no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const completedQualityChecks = await getCompletedQualityCheckRequests()
    expect(completedQualityChecks).toHaveLength(0)
  })

  test('should return zero completed quality check records when released is null', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create({ ...paymentRequest, released: undefined })
    const completedQualityChecks = await getCompletedQualityCheckRequests()
    expect(completedQualityChecks).toHaveLength(0)
  })
})
