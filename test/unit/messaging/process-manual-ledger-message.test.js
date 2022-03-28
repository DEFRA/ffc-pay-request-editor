jest.mock('ffc-messaging')
jest.mock('../../../app/data')
jest.mock('../../../app/manual-ledger')
const processManualLedgerDataMessage = require('../../../app/messaging/process-manual-ledger-data-message')
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
        paymentRequest: { paymentRequestId: 1234567890 },
        paymentRequests: [{ paymentRequestId: 1234567890 }]
      }
    }
    await processManualLedgerDataMessage(message, receiver)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })
})
