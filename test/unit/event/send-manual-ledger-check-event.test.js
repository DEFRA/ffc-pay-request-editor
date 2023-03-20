
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
const { LEDGER_ASSIGNMENT_REVIEWED } = require('../../../app/constants/events')

const sendManualLedgerCheckEvent = require('../../../app/event/send-manual-ledger-check-event')

let paymentRequest
let paymentRequestId
let user
let provisionalLedgerData
let event

beforeEach(async () => {
  uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

  config.useV1Events = true
  config.useV2Events = true
  messageConfig.eventTopic = 'v1-events'
  messageConfig.eventsTopic = 'v2-events'

  paymentRequestId = 1
  user = 'user1'
  provisionalLedgerData = {}
  paymentRequest = { paymentRequestId }

  event = {
    name: 'payment-request-ledger-assignment-reviewed',
    type: 'info',
    message: 'Payment request ledger assignment reviewed'
  }
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 send enrich request event when debt data attached', () => {
  test('when V1 events enabled should call mockSendEvent', async () => {
    config.useV1Events = true
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('when V1 events disabled should not call mockSendEvent', async () => {
    config.useV1Events = false
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should call uuidv4 when a paymentRequest is received', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(getCorrelationId).toHaveBeenCalled()
  })

  test('should call getCorrelationId with paymentRequestId when a paymentRequest with a valid paymentRequestId is received', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(getCorrelationId).toHaveBeenCalledWith(paymentRequest.paymentRequestId)
  })

  test('should raise event with event name', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].name).toBe(event.name)
  })

  test('should raise event with success status', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('success')
  })

  test('should raise info event type', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe(event.type)
  })

  test('should include message in event', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].properties.action.message).toBe(event.message)
  })

  test('should include user in event', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.user).toBe(user)
  })

  test('should include provisionalLedgerData in event', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.provisionalLedgerData).toBe(provisionalLedgerData)
  })
})

describe('V2 send enrich request event when debt data attached', () => {
  test('send V2 events when v2 events enabled ', async () => {
    config.useV2Events = true
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    config.useV2Events = false
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with source', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with event type', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(LEDGER_ASSIGNMENT_REVIEWED)
  })

  test('should include user in the event data', async () => {
    await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
    expect(mockPublishEvent.mock.calls[0][0].data.assignedBy).toBe(user)
  })
})
