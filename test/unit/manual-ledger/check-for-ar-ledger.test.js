const { AP, AR } = require('../../../app/processing/ledger/ledgers')
const { PENDING, AWAITING_ENRICHMENT } = require('../../../app/quality-check/statuses')

let mockManualLedgerRequests
let config
let checkForARLedger
let checkForDebtData
let copyDebtInformationFromArLedger
let sendEnrichRequestBlockedEvent

describe('checkForARLedger', () => {
  beforeEach(() => {
    mockManualLedgerRequests = require('../../mocks/mock-manual-ledger-requests')

    jest.mock('../../../app/config')
    config = require('../../../app/config')
    config.isAlerting = true

    jest.mock('../../../app/manual-ledger/check-for-debt-data')
    checkForDebtData = require('../../../app/manual-ledger/check-for-debt-data')
    checkForDebtData.mockReturnValue(null)

    jest.mock('../../../app/manual-ledger/copy-debt-information-from-ar-ledger')
    copyDebtInformationFromArLedger = require('../../../app/manual-ledger/copy-debt-information-from-ar-ledger')

    jest.mock('../../../app/event')
    sendEnrichRequestBlockedEvent = require('../../../app/event').sendEnrichRequestBlockedEvent

    checkForARLedger = require('../../../app/manual-ledger/check-for-ar-ledger')
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  const modifiers = [
    ['zero value', arr => arr.map(x => ({
      ...x,
      ledgerPaymentRequest: { ...x.ledgerPaymentRequest, value: 0 }
    }))],
    ['AP ledger', arr => arr.map(x => ({
      ...x,
      ledgerPaymentRequest: { ...x.ledgerPaymentRequest, ledger: AP }
    }))],
    ['empty request', () => [{ ledgerPaymentRequest: { ledger: AR, value: 0 } }]]
  ]

  describe('checkForDebtData calls', () => {
    test('should call checkForDebtData with first non-zero AR request', async () => {
      await checkForARLedger(mockManualLedgerRequests, PENDING)
      expect(checkForDebtData).toHaveBeenCalledWith(mockManualLedgerRequests[0])
      expect(checkForDebtData).toHaveBeenCalledTimes(1)
    })

    test.each(modifiers)('should not call checkForDebtData for %s requests', async (_, modify) => {
      const requests = modify([...mockManualLedgerRequests])
      await checkForARLedger(requests, PENDING)
      expect(checkForDebtData).not.toHaveBeenCalled()
    })
  })

  describe('copyDebtInformationFromArLedger calls', () => {
    test('should call with null or debt object depending on checkForDebtData return', async () => {
      await checkForARLedger(mockManualLedgerRequests, PENDING)
      expect(copyDebtInformationFromArLedger).toHaveBeenCalledWith(null, mockManualLedgerRequests[0])
      expect(copyDebtInformationFromArLedger).toHaveBeenCalledTimes(1)

      const debtObj = { test: 'exists' }
      checkForDebtData.mockReturnValue(debtObj)
      await checkForARLedger(mockManualLedgerRequests, PENDING)
      expect(copyDebtInformationFromArLedger).toHaveBeenCalledWith(debtObj, mockManualLedgerRequests[0])
    })

    test.each(modifiers)('should not call copyDebtInformationFromArLedger for %s requests', async (_, modify) => {
      const requests = modify([...mockManualLedgerRequests])
      await checkForARLedger(requests, PENDING)
      expect(copyDebtInformationFromArLedger).not.toHaveBeenCalled()
    })
  })

  describe('sendEnrichRequestBlockedEvent calls', () => {
    test('should call sendEnrichRequestBlockedEvent when checkForDebtData is null and alerting is true', async () => {
      await checkForARLedger(mockManualLedgerRequests, PENDING)
      expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledWith(mockManualLedgerRequests[0].ledgerPaymentRequest)
      expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledTimes(1)
    })

    test('should not call sendEnrichRequestBlockedEvent when alerting is false', async () => {
      config.isAlerting = false
      await checkForARLedger(mockManualLedgerRequests, PENDING)
      expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
    })

    test.each(modifiers)('should not call sendEnrichRequestBlockedEvent for %s requests', async (_, modify) => {
      const requests = modify([...mockManualLedgerRequests])
      await checkForARLedger(requests, PENDING)
      expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
    })
  })

  describe('return status', () => {
    const statusCases = [
      ['zero value', arr => arr.map(x => ({
        ...x,
        ledgerPaymentRequest: { ...x.ledgerPaymentRequest, value: 0 }
      })), PENDING],
      ['AP ledger', arr => arr.map(x => ({
        ...x,
        ledgerPaymentRequest: { ...x.ledgerPaymentRequest, ledger: AP }
      })), PENDING],
      ['empty request', () => [{ ledgerPaymentRequest: { ledger: AR, value: 0 } }], PENDING],
      ['debt exists', () => mockManualLedgerRequests, PENDING],
      ['no debt', () => mockManualLedgerRequests, AWAITING_ENRICHMENT]
    ]

    test.each(statusCases)('should return %s status', async (_, modify, expected) => {
      if (_ === 'debt exists') {
        checkForDebtData.mockReturnValue({ test: 'exists' })
      } else if (_ === 'no debt') {
        checkForDebtData.mockReturnValue(null)
      }

      const requests = modify([...mockManualLedgerRequests])
      const result = await checkForARLedger(requests, PENDING)
      expect(result).toBe(expected)
    })
  })
})
