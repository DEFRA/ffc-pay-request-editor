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

jest.mock('../../../app/config/mq-config')
const messageConfig = require('../../../app/config/mq-config')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

const { SOURCE } = require('../../../app/constants/source')
const { LEDGER_ASSIGNMENT_REVIEWED } = require('../../../app/constants/events')

const sendManualLedgerCheckEvent = require('../../../app/event/send-manual-ledger-check-event')

let paymentRequestId
let user
let provisionalLedgerData

describe('V2 send enrich request event when debt data attached', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    messageConfig.eventsTopic = 'v2-events'

    paymentRequestId = 1
    user = 'user1'
    provisionalLedgerData = {}
  })

  afterEach(async () => {
    jest.clearAllMocks()
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
