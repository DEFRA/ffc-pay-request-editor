
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
const { PAYMENT_REQUEST_ENRICHED } = require('../../../app/constants/events')

const sendEnrichRequestEvent = require('../../../app/event/send-enrich-request-event')

let paymentRequest
let event
let user

beforeEach(async () => {
  uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

  config.useV1Events = true
  config.useV2Events = true
  messageConfig.eventTopic = 'v1-events'
  messageConfig.eventsTopic = 'v2-events'

  paymentRequest = {
    paymentRequestId: 1
  }

  user = 'user1'

  event = {
    name: 'payment-request-enriched',
    type: 'info',
    message: 'Debt data attached to payment request.'
  }
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 send enrich request blocked event for payment request requiring debt data', () => {
  test('when V1 events enabled should call mockSendEvent', async () => {
    config.useV1Events = true
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('when V1 events disabled should call mockSendEvent', async () => {
    config.useV1Events = false
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should call uuidv4 when a paymentRequest is received', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(getCorrelationId).toHaveBeenCalled()
  })

  test('should call getCorrelationId with paymentRequestId when a paymentRequest with a valid paymentRequestId is received', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(getCorrelationId).toHaveBeenCalledWith(paymentRequest.paymentRequestId)
  })

  test('should call mockSendEvent with event name', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].name).toBe(event.name)
  })

  test('should call mockSendEvent with status', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('success')
  })

  test('should call mockSendEvent with event type', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe(event.type)
  })

  test('should call mockSendEvent with event.message', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].properties.action.message).toBe(event.message)
  })

  test('should include user in event data', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.user).toBe(user)
  })

  test('should include paymentRequest in event data', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.paymentRequest).toBe(paymentRequest)
  })
})

describe('V2 send enrich request blocked event for payment request requiring debt data', () => {
  test('send V2 events when v2 events enabled ', async () => {
    config.useV2Events = true
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    config.useV2Events = false
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with source', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with event type', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(PAYMENT_REQUEST_ENRICHED)
  })

  test('should include attachedBy in the event data', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent.mock.calls[0][0].data.attachedBy).toBe(user)
  })

  test('should include paymentRequestId in the event data', async () => {
    await sendEnrichRequestEvent(paymentRequest, user)
    expect(mockPublishEvent.mock.calls[0][0].data.paymentRequestId).toBe(paymentRequest.paymentRequestId)
  })
})
