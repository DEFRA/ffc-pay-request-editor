jest.mock('ffc-messaging')
// jest.mock('../../../app/data')
// jest.mock('../../../app/payment-request')

const publishQualityCheckRequest = require('../../../app/messaging/publish-quality-check-request')

let sender

describe('Publish quality checked payment requests', () => {
  beforeEach(() => {
    sender = { sendMessage: jest.fn() }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('completes valid message', async () => {
    const paymentRequest = {
      paymentRequestId: 1,
      schemeId: 2,
      frn: 1234567890,
      released: undefined
    }

    const message = {
      body: paymentRequest,
      type: 'uk.gov.pay.quality.check',
      source: 'ffc-pay-request-editor'
    }

    await publishQualityCheckRequest(paymentRequest, sender)
    expect(sender.sendMessage).toHaveBeenCalled()
    expect(sender.sendMessage).toHaveBeenCalledWith(message)
  })
})
