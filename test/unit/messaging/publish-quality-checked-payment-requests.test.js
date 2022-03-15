const { SCHEME_ID_SFI_PILOT } = require('../../data/scheme-id')

jest.mock('../../../app/payment-request')
const {
  getQualityCheckedPaymentRequests,
  updatePaymentRequestReleased
} = require('../../../app/payment-request')

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
    qualityCheckedPaymentRequests = [{
      paymentRequestId: 1,
      invoiceNumber: 'SFI123',
      frn: 1234567890,
      debtType: undefined,
      recoveryDate: undefined
    }]
    getQualityCheckedPaymentRequests.mockReturnValue(JSON.parse(JSON.stringify(qualityCheckedPaymentRequests)))

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

  test('calls internal loop function', async () => {
    await publishQualityCheckedPaymentRequests(qualityCheckSender)
    expect(updatePaymentRequestReleased).toHaveBeenCalledTimes(1)
    expect(updatePaymentRequestReleased).toHaveBeenCalledWith(qualityCheckedPaymentRequests[0].paymentRequestId)
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
