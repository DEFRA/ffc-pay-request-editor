const { getSender, sendMessage: sendServiceBusMessage } = require('../../../app/messaging/service-bus')
const createMessage = require('../../../app/messaging/create-message')

jest.mock('../../../app/messaging/service-bus')
jest.mock('../../../app/messaging/create-message')

const sendMessage = require('../../../app/messaging/send-message')

const MOCK_MESSAGE_BODY = { foo: 'bar' }
const MOCK_TYPE = 'type'
const MOCK_CONFIG = { host: 'test.servicebus.windows.net', address: 'test-topic' }
const MOCK_OPTIONS = { transactionId: 'abc' }

describe('send message', () => {
  let mockSender

  beforeEach(() => {
    jest.clearAllMocks()
    mockSender = { sendMessages: jest.fn() }
    getSender.mockReturnValue(mockSender)
    sendServiceBusMessage.mockResolvedValue()
    createMessage.mockReturnValue({
      body: MOCK_MESSAGE_BODY,
      type: MOCK_TYPE,
      source: 'ffc-pay-request-editor'
    })
  })

  test('gets sender from service bus for config', async () => {
    await sendMessage(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_CONFIG, MOCK_OPTIONS)
    expect(getSender).toHaveBeenCalledWith(MOCK_CONFIG)
  })

  test('creates message with body, type and options', async () => {
    await sendMessage(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_CONFIG, MOCK_OPTIONS)
    expect(createMessage).toHaveBeenCalledWith(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_OPTIONS)
  })

  test('calls sendServiceBusMessage once with sender and message', async () => {
    await sendMessage(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_CONFIG, MOCK_OPTIONS)
    expect(sendServiceBusMessage).toHaveBeenCalledTimes(1)
    expect(sendServiceBusMessage).toHaveBeenCalledWith(mockSender, {
      body: MOCK_MESSAGE_BODY,
      type: MOCK_TYPE,
      source: 'ffc-pay-request-editor'
    })
  })
})
