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
const { LEDGER_ASSIGNMENT_QUALITY_CHECK } = require('../../../app/constants/events')

const sendManualLedgerReviewEvent = require('../../../app/event/send-manual-ledger-review-event')

let paymentRequestId
let user
let status

describe('V2 send manual ledger review event when payment request quality checked', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    config.useV2Events = true
    messageConfig.eventsTopic = 'v2-events'

    paymentRequestId = 1
    user = 'user1'
    status = 'approved'
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('send V2 events when v2 events enabled ', async () => {
    config.useV2Events = true
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    config.useV2Events = false
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with source', async () => {
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with type', async () => {
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent.mock.calls[0][0].type).toBe(`${LEDGER_ASSIGNMENT_QUALITY_CHECK}${status}`)
  })

  test('should include user in the event data', async () => {
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent.mock.calls[0][0].data.qualityCheckedBy).toBe(user)
  })

  test('should include status in the event data', async () => {
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)

    expect(mockPublishEvent.mock.calls[0][0].data.status).toBe(status)
  })
})
