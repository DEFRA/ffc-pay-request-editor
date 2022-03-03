const db = require('../../../../app/data')
const { updatePaymentRequestReleased } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')

describe('Update quality check released test', () => {
  let paymentRequest

  beforeEach(async () => {
    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    await db.paymentRequest.truncate({ cascade: true })
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
