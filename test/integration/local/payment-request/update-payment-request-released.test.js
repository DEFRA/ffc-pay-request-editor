const db = require('../../../../app/data')
const { updatePaymentRequestReleased } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')

const resetData = async () => {
  await db.scheme.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Update payment request released test', () => {
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
      released: undefined
    }

    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
  })

  test('should return null released before updating', async () => {
    const paymentRequestBeforeUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestBeforeUpdate.released).toBeNull()
  })

  test('should return not null released after updating', async () => {
    await updatePaymentRequestReleased(paymentRequest.paymentRequestId)
    const paymentRequestAfterUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestAfterUpdate.released).not.toBeNull()
  })
})
