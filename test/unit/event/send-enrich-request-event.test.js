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
const { PAYMENT_REQUEST_ENRICHED } = require('../../../app/constants/events')

const sendEnrichRequestEvent = require('../../../app/event/send-enrich-request-event')

let paymentRequest
let user

describe('V2 send enrich request blocked event for payment request requiring debt data', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    config.useV2Events = true
    messageConfig.eventsTopic = 'v2-events'

    paymentRequest = {
      paymentRequestId: 1
    }

    user = 'user1'
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

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
