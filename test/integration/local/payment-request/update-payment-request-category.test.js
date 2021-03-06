const db = require('../../../../app/data')
const { updatePaymentRequestCategory } = require('../../../../app/payment-request')
const { LEDGER_CHECK, ENRICHMENT } = require('../../../../app/payment-request/categories')
const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')

const resetData = async () => {
  await db.scheme.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Update payment request category test', () => {
  let paymentRequest

  beforeEach(async () => {
    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      categoryId: LEDGER_CHECK
    }

    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  test('should return LEDGER_CHECK before update', async () => {
    const paymentRequestBeforeUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestBeforeUpdate.categoryId).toBe(LEDGER_CHECK)
  })

  test('should return ENRICHMENT category after update', async () => {
    await updatePaymentRequestCategory(paymentRequest.paymentRequestId, ENRICHMENT)
    const paymentRequestAfterUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestAfterUpdate.categoryId).toBe(ENRICHMENT)
  })
})
