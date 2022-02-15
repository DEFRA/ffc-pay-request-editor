jest.mock('ffc-messaging')
jest.mock('../../../app/data')
jest.mock('../../../app/payment-request')
const processDebtDataMessage = require('../../../app/messaging/process-debt-data-message')
let receiver

describe('process payment message', () => {
  beforeEach(() => {
    receiver = {
      completeMessage: jest.fn(),
      abandonMessage: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('completes valid message', async () => {
    const message = {
      body: {
        frn: 1234567890
      }
    }
    await processDebtDataMessage(message, receiver)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })
})
