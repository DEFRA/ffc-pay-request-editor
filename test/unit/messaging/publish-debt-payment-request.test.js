jest.mock('../../../app/messaging/create-message')
jest.mock('../../../app/quality-check')
jest.mock('../../../app/manual-ledger')
jest.mock('../../../app/payment-request')

const createMessage = require('../../../app/messaging/create-message')
const { updateQualityChecksStatus } = require('../../../app/quality-check')
const { PASSED, PROCESSED } = require('../../../app/quality-check/statuses')
const { LEDGER_CHECK } = require('../../../app/payment-request/categories')
const { checkAwaitingManualLedgerDebtData } = require('../../../app/manual-ledger')
const {
  getDebtPaymentRequests,
  updatePaymentRequestReleased,
  updatePaymentRequestCategory
} = require('../../../app/payment-request')

const {
  publishDebtPaymentRequests,
  publishPaymentRequest
} = require('../../../app/messaging/publish-debt-payment-request')

describe('publishDebtPaymentRequests', () => {
  let debtSender
  let paymentRequest

  beforeEach(() => {
    paymentRequest = {
      paymentRequestId: 1,
      frn: 1234567890,
      invoiceNumber: 'INV-001'
    }

    debtSender = { sendMessage: jest.fn() }

    getDebtPaymentRequests.mockResolvedValue([{ ...paymentRequest }])
    checkAwaitingManualLedgerDebtData.mockResolvedValue(false)
    updatePaymentRequestCategory.mockResolvedValue()
    updateQualityChecksStatus.mockResolvedValue()
    updatePaymentRequestReleased.mockResolvedValue()
    createMessage.mockReturnValue({
      body: { frn: paymentRequest.frn, invoiceNumber: paymentRequest.invoiceNumber },
      type: 'uk.gov.defra.ffc.pay.debt.check',
      source: 'ffc-pay-request-editor'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('publishes payment request and marks as released when not awaiting manual ledger debt data', async () => {
    await publishDebtPaymentRequests(debtSender)

    expect(debtSender.sendMessage).toHaveBeenCalledTimes(1)
    expect(updatePaymentRequestReleased).toHaveBeenCalledTimes(1)
    expect(updatePaymentRequestReleased).toHaveBeenCalledWith(paymentRequest.paymentRequestId)
    expect(updateQualityChecksStatus).toHaveBeenCalledWith(paymentRequest.paymentRequestId, PROCESSED)
  })

  test('updates category to LEDGER_CHECK and sets status to PASSED when awaiting manual ledger debt data', async () => {
    checkAwaitingManualLedgerDebtData.mockResolvedValue(true)

    await publishDebtPaymentRequests(debtSender)

    expect(updatePaymentRequestCategory).toHaveBeenCalledWith(paymentRequest.paymentRequestId, LEDGER_CHECK)
    expect(updateQualityChecksStatus).toHaveBeenCalledWith(paymentRequest.paymentRequestId, PASSED)
    expect(debtSender.sendMessage).not.toHaveBeenCalled()
    expect(updatePaymentRequestReleased).not.toHaveBeenCalled()
  })

  test('does not send message when awaiting manual ledger debt data', async () => {
    checkAwaitingManualLedgerDebtData.mockResolvedValue(true)

    await publishDebtPaymentRequests(debtSender)

    expect(debtSender.sendMessage).not.toHaveBeenCalled()
  })

  test('deletes paymentRequestId from payment request before publishing', async () => {
    let capturedBody
    debtSender.sendMessage.mockImplementation((msg) => {
      capturedBody = msg.body
    })
    createMessage.mockImplementation((body) => ({ body }))

    await publishDebtPaymentRequests(debtSender)

    expect(capturedBody).not.toHaveProperty('paymentRequestId')
  })

  test('logs completion with frn and invoiceNumber after publishing', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    await publishDebtPaymentRequests(debtSender)

    expect(consoleSpy).toHaveBeenCalledWith('Completed request sent:', {
      frn: paymentRequest.frn,
      invoiceNumber: paymentRequest.invoiceNumber
    })

    consoleSpy.mockRestore()
  })

  test('catches and logs error when getDebtPaymentRequests throws', async () => {
    const error = new Error('DB connection failed')
    getDebtPaymentRequests.mockRejectedValue(error)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await publishDebtPaymentRequests(debtSender)

    expect(consoleSpy).toHaveBeenCalledWith('Unable to process payment request message:', error)
    expect(debtSender.sendMessage).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  test('catches and logs error when checkAwaitingManualLedgerDebtData throws', async () => {
    const error = new Error('Manual ledger check failed')
    checkAwaitingManualLedgerDebtData.mockRejectedValue(error)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await publishDebtPaymentRequests(debtSender)

    expect(consoleSpy).toHaveBeenCalledWith('Unable to process payment request message:', error)

    consoleSpy.mockRestore()
  })

  test('processes multiple payment requests', async () => {
    const secondPaymentRequest = {
      paymentRequestId: 2,
      frn: 9876543210,
      invoiceNumber: 'INV-002'
    }
    getDebtPaymentRequests.mockResolvedValue([{ ...paymentRequest }, { ...secondPaymentRequest }])

    await publishDebtPaymentRequests(debtSender)

    expect(debtSender.sendMessage).toHaveBeenCalledTimes(2)
    expect(updatePaymentRequestReleased).toHaveBeenCalledTimes(2)
    expect(updateQualityChecksStatus).toHaveBeenCalledTimes(2)
  })

  test('does nothing when there are no debt payment requests', async () => {
    getDebtPaymentRequests.mockResolvedValue([])

    await publishDebtPaymentRequests(debtSender)

    expect(debtSender.sendMessage).not.toHaveBeenCalled()
    expect(updatePaymentRequestReleased).not.toHaveBeenCalled()
    expect(updateQualityChecksStatus).not.toHaveBeenCalled()
  })
})

describe('publishPaymentRequest', () => {
  let debtSender
  let paymentRequest
  let message

  beforeEach(() => {
    paymentRequest = {
      frn: 1234567890,
      invoiceNumber: 'INV-001'
    }

    message = {
      body: paymentRequest,
      type: 'uk.gov.defra.ffc.pay.debt.check',
      source: 'ffc-pay-request-editor'
    }

    debtSender = { sendMessage: jest.fn() }
    createMessage.mockReturnValue(message)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('creates message with correct type', async () => {
    await publishPaymentRequest(paymentRequest, debtSender)

    expect(createMessage).toHaveBeenCalledWith(paymentRequest, 'uk.gov.defra.ffc.pay.debt.check')
  })

  test('sends the created message via debtSender', async () => {
    await publishPaymentRequest(paymentRequest, debtSender)

    expect(debtSender.sendMessage).toHaveBeenCalledTimes(1)
    expect(debtSender.sendMessage).toHaveBeenCalledWith(message)
  })

  test('logs completion with frn and invoiceNumber', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    await publishPaymentRequest(paymentRequest, debtSender)

    expect(consoleSpy).toHaveBeenCalledWith('Completed request sent:', {
      frn: paymentRequest.frn,
      invoiceNumber: paymentRequest.invoiceNumber
    })

    consoleSpy.mockRestore()
  })
})
