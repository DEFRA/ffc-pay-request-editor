const { SCHEME_ID_SFI } = require('../../data/scheme-id')

jest.mock('../../../app/payment-request')
const { updatePaymentRequestReleased } = require('../../../app/payment-request')

jest.mock('../../../app/quality-check')
const { getQualityCheckedPaymentRequests } = require('../../../app/quality-check')

const {
  publishQualityCheckedPaymentRequests,
  publishPaymentRequest
} = require('../../../app/messaging/publish-quality-checked-payment-request')

describe('Publish quality checked payment requests', () => {
  let qualityCheckedPaymentRequests
  let qualityCheckSender
  let paymentRequest
  let message

  beforeEach(async () => {
    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI,
      frn: 1234567890,
      agreementNumber: 'SIP00000000000001',
      released: undefined,
      categoryId: 2,
      netValue: 15000
    }

    qualityCheckedPaymentRequests = [{
      paymentRequest
    }]

    getQualityCheckedPaymentRequests.mockReturnValue(qualityCheckedPaymentRequests)

    qualityCheckSender = { sendMessage: jest.fn() }

    message = {
      body: paymentRequest,
      type: 'uk.gov.defra.ffc.pay.quality.check',
      source: 'ffc-pay-request-editor'
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('calls internal loop function', async () => {
    await publishQualityCheckedPaymentRequests(qualityCheckSender)
    expect(updatePaymentRequestReleased).toHaveBeenCalledTimes(1)
    expect(updatePaymentRequestReleased).toHaveBeenCalledWith(qualityCheckedPaymentRequests[0].paymentRequest.paymentRequestId)
  })

  test('error is caught and returned', async () => {
    getQualityCheckedPaymentRequests.mockImplementation(() => {
      throw new Error()
    })

    await publishQualityCheckedPaymentRequests(qualityCheckSender)
    expect(updatePaymentRequestReleased).not.toHaveBeenCalled()
  })

  test('completes valid message', async () => {
    await publishPaymentRequest(paymentRequest, qualityCheckSender)
    expect(qualityCheckSender.sendMessage).toHaveBeenCalled()
    expect(qualityCheckSender.sendMessage).toHaveBeenCalledWith(message)
  })
})
