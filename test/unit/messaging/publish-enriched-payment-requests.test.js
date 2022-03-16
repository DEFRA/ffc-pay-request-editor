jest.mock('ffc-messaging')
const { SCHEME_ID_SFI_PILOT } = require('../../data/scheme-id')

jest.mock('../../../app/payment-request')
const {
  getEnrichedPaymentRequests,
  updatePaymentRequestReleased
} = require('../../../app/payment-request')

const {
  publishEnrichedPaymentRequests,
  publishPaymentRequest
} = require('../../../app/messaging/publish-enriched-payment-request')

describe('Publish enriched payment requests', () => {
  let enrichedPaymentRequests
  let debtResponseSender
  let paymentRequest
  let message

  beforeEach(async () => {
    enrichedPaymentRequests = [{
      paymentRequestId: 1,
      invoiceNumber: 'SFI123',
      frn: 1234567890,
      debtType: undefined,
      recoveryDate: undefined
    }]
    getEnrichedPaymentRequests.mockReturnValue(JSON.parse(JSON.stringify(enrichedPaymentRequests)))

    debtResponseSender = { sendMessage: jest.fn() }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined
    }

    message = {
      body: paymentRequest,
      type: 'uk.gov.pay.debt.data.response',
      source: 'ffc-pay-request-editor'
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('calls internal loop function', async () => {
    await publishEnrichedPaymentRequests(debtResponseSender)
    expect(updatePaymentRequestReleased).toHaveBeenCalledTimes(1)
    expect(updatePaymentRequestReleased).toHaveBeenCalledWith(enrichedPaymentRequests[0].paymentRequestId)
  })

  test('error is caught and returned', async () => {
    getEnrichedPaymentRequests.mockImplementation(() => {
      throw new Error()
    })

    await publishEnrichedPaymentRequests(debtResponseSender)
    expect(updatePaymentRequestReleased).not.toHaveBeenCalled()
  })

  test('completes valid message', async () => {
    await publishPaymentRequest(paymentRequest, debtResponseSender)
    expect(debtResponseSender.sendMessage).toHaveBeenCalled()
    expect(debtResponseSender.sendMessage).toHaveBeenCalledWith(message)
  })
})
