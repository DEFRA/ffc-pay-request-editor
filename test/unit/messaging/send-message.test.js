const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()
jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
        closeConnection: mockCloseConnection
      }
    })
  }
})
const sendMessage = require('../../../app/messaging/send-message')
const MOCK_MESSAGE_BODY = { foo: 'bar' }
const MOCK_TYPE = 'type'
const MOCK_CONFIG = {}
const MOCK_OPTIONS = {}

describe('send message', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls send message once', async () => {
    await sendMessage(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_CONFIG, MOCK_OPTIONS)
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
  })

  test('calls send message with body', async () => {
    await sendMessage(MOCK_MESSAGE_BODY, MOCK_TYPE, MOCK_CONFIG, MOCK_OPTIONS)
    expect(mockSendMessage.mock.calls[0][0].body).toBe(MOCK_MESSAGE_BODY)
  })
})
