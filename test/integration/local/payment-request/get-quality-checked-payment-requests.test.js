const db = require('../../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { DEBT_TYPE_IRREGULAR } = require('../../../data/debt-types')

describe('Get released payment request test', () => {
  let paymentRequest

  beforeEach(async () => {
    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
    }

    const debtData = {
      paymentRequestId: 1,
      debtType: DEBT_TYPE_IRREGULAR
    }

    const invoiceLine = {
      paymentRequestId: 1,
      value: 10000
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    await db.sequelize.truncate({ cascade: true })
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.debtData.create(debtData)
    await db.invoiceLine.create(invoiceLine)
  })

  test('should return 1 payment request record when released is null', async () => {
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(1)
  })

  test('should return 0 payment request record when no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when released is not null', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create({ ...paymentRequest, released: new Date() })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })
})
