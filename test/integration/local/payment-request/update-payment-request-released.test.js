const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { updatePaymentRequestReleased } = require('../../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')

const resetData = async () => {
  await truncate(['schemes'])
  await truncate(['paymentRequests'])
}

describe('Update payment request released test', () => {
  let paymentRequest

  beforeEach(async () => {
    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      name: SCHEME_NAME_SFI_PILOT
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    await resetData()
    await db.scheme().insert(scheme)
    await db.paymentRequest().insert(paymentRequest)
  })

  test('should return null released before updating', async () => {
    const paymentRequestBeforeUpdate = await db.paymentRequest().where({ paymentRequestId: paymentRequest.paymentRequestId }).first()
    expect(paymentRequestBeforeUpdate.released).toBeNull()
  })

  test('should return not null released after updating', async () => {
    await updatePaymentRequestReleased(paymentRequest.paymentRequestId)
    const paymentRequestAfterUpdate = await db.paymentRequest().where({ paymentRequestId: paymentRequest.paymentRequestId }).first()
    expect(paymentRequestAfterUpdate.released).not.toBeNull()
  })
})
