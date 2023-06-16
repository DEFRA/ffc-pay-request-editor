const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config')
const config = require('../../../app/config')

jest.mock('../../../app/config/mq-config')
const messageConfig = require('../../../app/config/mq-config')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_REQUEST_BLOCKED } = require('../../../app/constants/events')

const sendEnrichRequestBlockedEvent = require('../../../app/event/send-enrich-request-blocked-event')

const error = {
  message: 'Payment request does not have debt data to attach'
}

let paymentRequest

describe('V2 send enrich request blocked event for payment request requiring debt data', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    config.useV2Events = true
    messageConfig.eventsTopic = 'v2-events'

    paymentRequest = {
      paymentRequestId: 1
    }
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('send V2 event when v2 events enabled ', async () => {
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

  test('should raise an event with source', async () => {
    await sendEnrichRequestBlockedEvent(paymentRequest)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with event type', async () => {
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
