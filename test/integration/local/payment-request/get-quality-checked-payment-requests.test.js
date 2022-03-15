const db = require('../../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { IRREGULAR } = require('../../../../app/debt-types')

describe('Get released payment request test', () => {
  let paymentRequest
  let debtData

  beforeEach(async () => {
    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
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

    debtData = {
      paymentRequestId: 1,
      debtType: IRREGULAR,
      recoveryDate: '10/11/2021'
    }

    await db.sequelize.truncate({ cascade: true })
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.debtData.create(debtData)
    await db.invoiceLine.create(invoiceLine)
  })

  test('should return 1 payment request record when released is null and debt data record with matching id', async () => {
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(1)
  })

  test('should return 0 payment request records when no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request records when released is null and no debt data records', async () => {
    await db.debtData.truncate({ cascade: true })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request records when released is not null and debt data records', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create({ ...paymentRequest, released: new Date() })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when released is null and debt data record with matching id and null debtType', async () => {
    await db.debtData.truncate({ cascade: true })
    await db.debtData.create({ ...debtData, debtType: undefined })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when released is null and debt data record with matching id and null recoveryDate', async () => {
    await db.debtData.truncate({ cascade: true })
    await db.debtData.create({ ...debtData, recoveryDate: undefined })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when released is null and debt data record with matching id and null debtType and recoveryDate', async () => {
    await db.debtData.truncate({ cascade: true })
    await db.debtData.create({ ...debtData, debtType: undefined, recoveryDate: undefined })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })
})
