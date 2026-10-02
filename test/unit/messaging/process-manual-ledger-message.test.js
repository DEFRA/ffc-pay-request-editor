const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock([])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock('ffc-messaging')
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
