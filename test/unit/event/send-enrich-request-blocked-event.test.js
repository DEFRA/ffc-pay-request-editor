jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

jest.mock('../../../app/payment-request/get-correlation-id')
const getCorrelationId = require('../../../app/payment-request/get-correlation-id')

const sendEnrichRequestBlockedEvent = require('../../../app/event/send-enrich-request-blocked-event')

let paymentRequest
let event

describe('Payment requests requiring debt data with none to attach', () => {
  beforeEach(async () => {
    paymentRequest = {
      paymentRequestId: 1
    }

    event = {
      name: 'payment-request-blocked',
      type: 'blocked',
      message: 'Payment request does not have debt data to attach.'
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call getCorrelationId when a paymentRequest with a valid paymentRequestId is received', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(getCorrelationId).toHaveBeenCalled()
  })

  test('should call getCorrelationId with paymentRequestId when a paymentRequest with a valid paymentRequestId is received', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(getCorrelationId).toHaveBeenCalledWith(paymentRequest.paymentRequestId)
  })

  test('should not call getCorrelationId when a paymentRequest with an invalid paymentRequestId is received', async () => {
    paymentRequest.paymentRequestId = undefined
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(getCorrelationId).not.toHaveBeenCalled()
  })

  test('should call raiseEvent when a valid paymentRequest is received', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent with event including correlationId when a paymentRequest with a valid paymentRequestId is received and when getCorrelationId returns a GUID', async () => {
    getCorrelationId.mockImplementation(() => '9e016c50-046b-4597-b79a-ebe4f0bf8505')
    const correlationId = getCorrelationId()
    event = {
      ...event,
      id: correlationId,
      data: { paymentRequest }
    }

    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalledWith(event)
  })

  test('should call raiseEvent with event including paymentRequestId when a paymentRequest with a valid paymentRequestId is received and when getCorrelationId returns an empty string', async () => {
    getCorrelationId.mockImplementation(() => '')
    event = {
      ...event,
      id: paymentRequest.paymentRequestId,
      data: { paymentRequest }
    }

    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalledWith(event)
  })

  test('should call raiseEvent with event including paymentRequestId when a paymentRequest with a valid paymentRequestId is received and when getCorrelationId returns undefined', async () => {
    getCorrelationId.mockImplementation(() => undefined)
    event = {
      ...event,
      id: paymentRequest.paymentRequestId,
      data: { paymentRequest }
    }

    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalledWith(event)
  })

  test('should not call raiseEvent when a paymentRequest with an undefined paymentRequestId is received', async () => {
    paymentRequest.paymentRequestId = undefined
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).not.toHaveBeenCalled()
  })

  test('should not call raiseEvent when a paymentRequest with an empty string paymentRequestId is received', async () => {
    paymentRequest.paymentRequestId = ''
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(raiseEvent).not.toHaveBeenCalled()
  })
})
