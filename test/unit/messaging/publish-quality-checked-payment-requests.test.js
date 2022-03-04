jest.mock('ffc-messaging')

const publishQualityCheckedPaymentRequest = require('../../../app/messaging/publish-quality-checked-payment-request')

let sender

describe('Publish quality checked payment requests', () => {
  let paymentRequest
  let message

  beforeEach(() => {
    sender = { sendMessage: jest.fn() }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: 2,
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
    await publishQualityCheckedPaymentRequest(paymentRequest, sender)
    expect(sender.sendMessage).toHaveBeenCalled()
    expect(sender.sendMessage).toHaveBeenCalledWith(message)
  })
})
