jest.mock('../../../app/messaging/service-bus')
jest.mock('../../../app/data', () => ({}))
jest.mock('../../../app/config', () => ({
  debtSubscription: { host: 'namespace', address: 'debt-subscription', type: 'subscription' },
  manualLedgerSubscription: { address: 'manual-ledger-subscription', type: 'subscription' },
  retentionSubscription: { address: 'retention-subscription', type: 'subscription' },
  qcTopic: { address: 'quality-check-topic' },
  debtResponseTopic: { address: 'debt-response-topic' },
  publishPollingInterval: 10000
}))
jest.useFakeTimers()

const {
  createServiceBusClient,
  createReceiver,
  subscribeReceiver,
  closeSenders
} = require('../../../app/messaging/service-bus')
const messageService = require('../../../app/messaging')

describe('messaging', () => {
  let mockClient
  let mockReceiver
  let mockSender

  beforeEach(() => {
    jest.clearAllMocks()
    mockReceiver = { subscribe: jest.fn() }
    mockSender = { sendMessages: jest.fn() }
    mockClient = {
      createSender: jest.fn().mockReturnValue(mockSender),
      close: jest.fn().mockResolvedValue()
    }
    createServiceBusClient.mockReturnValue(mockClient)
    createReceiver.mockReturnValue(mockReceiver)
    subscribeReceiver.mockReturnValue()
    closeSenders.mockResolvedValue()
  })

  afterEach(async () => {
    await messageService.stop()
  })

  test('starts', async () => {
    await messageService.start()
    expect(createServiceBusClient).toHaveBeenCalledTimes(1)
    expect(createReceiver).toHaveBeenCalledTimes(3)
    expect(subscribeReceiver).toHaveBeenCalledTimes(3)
    expect(mockClient.createSender).toHaveBeenNthCalledWith(1, 'quality-check-topic')
    expect(mockClient.createSender).toHaveBeenNthCalledWith(2, 'debt-response-topic')
  })

  test('stops closes senders and client', async () => {
    await messageService.start()
    await messageService.stop()
    expect(closeSenders).toHaveBeenCalledTimes(1)
    expect(mockClient.close).toHaveBeenCalledTimes(1)
  })
})
