
const mockSendEvent = jest.fn()
const mockPublishEvent = jest.fn()

const MockPublishEvent = jest.fn().mockImplementation(() => {
  return {
    sendEvent: mockSendEvent
  }
})

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEvent: MockPublishEvent,
    EventPublisher: MockEventPublisher
  }
})
jest.mock('../../../app/config')
const config = require('../../../app/config')

jest.mock('../../../app/config/mq-config')
const messageConfig = require('../../../app/config/mq-config')

jest.mock('../../../app/payment-request/get-correlation-id')
const getCorrelationId = require('../../../app/payment-request/get-correlation-id')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_REQUEST_BLOCKED } = require('../../../app/constants/events')

const sendEnrichRequestBlockedEvent = require('../../../app/event/send-enrich-request-blocked-event')

const error = {
  message: 'Payment request does not have debt data to attach'
}

let paymentRequest
let event

describe('V1 send enrich request blocked event for payment request requiring debt data', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    config.useV1Events = true
    config.useV2Events = true
    messageConfig.eventTopic = 'v1-events'
    messageConfig.eventsTopic = 'v2-events'

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
    jest.clearAllMocks()
  })

  test('when V1 events enabled should call mockSendEvent when a paymentRequestis received', async () => {
    config.useV1Events = true
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('when V1 events disabled should call mockSendEvent when a paymentRequestis received', async () => {
    config.useV1Events = false
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should call uuidv4 when a paymentRequest is received', async () => {
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

  test('should raise event with batch-processing-error event name', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent.mock.calls[0][0].name).toBe(event.name)
  })

  test('should raise event with error status', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('should raise error event type', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe(event.type)
  })

  test('should include error message in event', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockSendEvent.mock.calls[0][0].properties.action.message).toBe(event.message)
  })

  test('should throw error if no error provided', async () => {
    await expect(() => sendEnrichRequestBlockedEvent(paymentRequest)).rejects.toThrow()
  })
})

describe('V2 send enrich request blocked event for payment request requiring debt data', () => {
  test('send V2 events when v2 events enabled ', async () => {
    config.useV2Events = true
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    config.useV2Events = false
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch-processor source', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with batch rejected event', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(PAYMENT_REQUEST_BLOCKED)
  })

  test('should include error message in the event data', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent.mock.calls[0][0].data.message).toBe(error.message)
  })

  test('should include payment request in the event data', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent.mock.calls[0][0].data.paymentRequestId).toBe(paymentRequest.paymentRequestId)
  })
})
