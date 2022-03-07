const { SCHEME_ID_SFI_PILOT } = require('../../data/scheme-id')

const { publishPaymentRequest } = require('../../../app/messaging/publish-quality-checked-payment-request')

describe('Publish quality checked payment requests', () => {
  let qualityCheckSender
  let paymentRequest
  let message

  beforeEach(async () => {
    qualityCheckSender = { sendMessage: jest.fn() }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    message = {
      body: paymentRequest,
      type: 'uk.gov.pay.quality.check',
      source: 'ffc-pay-request-editor'
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('completes valid message', async () => {
    await publishPaymentRequest(paymentRequest, qualityCheckSender)
    expect(qualityCheckSender.sendMessage).toHaveBeenCalled()
    expect(qualityCheckSender.sendMessage).toHaveBeenCalledWith(message)
  })
})
