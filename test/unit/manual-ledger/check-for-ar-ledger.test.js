const { AP } = require('../../../app/processing/ledger/ledgers')
const {
  PENDING,
  AWAITING_ENRICHMENT
} = require('../../../app/quality-check/statuses')

let mockManualLedgerRequests

let config
let checkForARLedger
let checkForDebtData
let attachDebtInformation
let sendEnrichRequestBlockedEvent

describe('check for ar ledger', () => {
  beforeEach(async () => {
    mockManualLedgerRequests = require('./mock-manual-ledger-requests')

    jest.mock('../../../app/config')
    config = require('../../../app/config')

    jest.mock('../../../app/manual-ledger/check-for-debt-data')
    checkForDebtData = require('../../../app/manual-ledger/check-for-debt-data')
    checkForDebtData.mockReturnValue(null)

    jest.mock('../../../app/manual-ledger/attach-debt-information')
    attachDebtInformation = require('../../../app/manual-ledger/attach-debt-information')

    jest.mock('../../../app/event')
    sendEnrichRequestBlockedEvent = require('../../../app/event').sendEnrichRequestBlockedEvent

    checkForARLedger = require('../../../app/manual-ledger/check-for-ar-ledger')

    config.isAlerting = true
  })

  afterEach(async () => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  test('should call checkForDebtData when mockManualLedgerRequests and PENDING status are received', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(checkForDebtData).toHaveBeenCalled()
  })

  test('should call checkForDebtData once when mockManualLedgerRequests and PENDING status are received', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(checkForDebtData).toHaveBeenCalledTimes(1)
  })

  test('should call checkForDebtData with 1 mockManualLedgerRequest when mockManualLedgerRequests and PENDING status are received', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(checkForDebtData).toHaveBeenCalledWith(mockManualLedgerRequests[0])
  })

  test('should call checkForDebtData with 1st AR mockManualLedgerRequest when multiple AR mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests = [mockManualLedgerRequests[0],
      {
        ...mockManualLedgerRequests[0],
        frn: 9999999999
      }
    ]

    await checkForARLedger(mockManualLedgerRequests, PENDING)

    expect(checkForDebtData).toHaveBeenCalledWith(mockManualLedgerRequests[0])
  })

  test('should not call checkForDebtData when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(checkForDebtData).not.toHaveBeenCalled()
  })

  test('should call checkForDebtData with 1st non-zero value AR mockManualLedgerRequest when multiple AR mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests = [mockManualLedgerRequests[0],
      {
        ...mockManualLedgerRequests[0],
        value: 0
      }
    ]

    await checkForARLedger(mockManualLedgerRequests, PENDING)

    expect(checkForDebtData).toHaveBeenCalled()
  })

  test('should not call checkForDebtData when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(checkForDebtData).not.toHaveBeenCalled()
  })

  test('should not call checkForDebtData when an empty manualLedgerRequests and PENDING status are received', async () => {
    await checkForARLedger([{}], PENDING)
    expect(checkForDebtData).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when an empty manualLedgerRequest and PENDING status are received', async () => {
    await checkForARLedger([{}], PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when an empty manualLedgerRequest and PENDING status are received', async () => {
    await checkForARLedger([{}], PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when an empty manualLedgerRequest and PENDING status are received', async () => {
    await checkForARLedger([{}], PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should not call attachDebtInformation when an empty manualLedgerRequest and PENDING status are received', async () => {
    await checkForARLedger([{}], PENDING)
    expect(attachDebtInformation).not.toHaveBeenCalled()
  })

  test('should call sendEnrichRequestBlockedEvent when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is true', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalled()
  })

  test('should call sendEnrichRequestBlockedEvent once when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is true', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendEnrichRequestBlockedEvent with mockManualLedgerRequest when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is true', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledWith(mockManualLedgerRequests[0])
  })

  test('should not call sendEnrichRequestBlockedEvent when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is false', async () => {
    config.isAlerting = false
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should call attachDebtInformation when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns null', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalled()
  })

  test('should call attachDebtInformation once when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns null', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalledTimes(1)
  })

  test('should call attachDebtInformation with null and mockManualLedgerRequest when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns null', async () => {
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalledWith(null, mockManualLedgerRequests[0])
  })

  test('should call attachDebtInformation when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns an object', async () => {
    checkForDebtData.mockReturnValue({ test: 'value does not matter, just that it exists' })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalled()
  })

  test('should call attachDebtInformation once when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns an object', async () => {
    checkForDebtData.mockReturnValue({ test: 'value does not matter, just that it exists' })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalledTimes(1)
  })

  test('should call attachDebtInformation with empty object and mockManualLedgerRequest when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns an object', async () => {
    checkForDebtData.mockReturnValue({ test: 'value does not matter, just that it exists' })
    await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(attachDebtInformation).toHaveBeenCalledWith({ test: 'value does not matter, just that it exists' }, mockManualLedgerRequests[0])
  })

  test('should return PENDING status when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when an empty manualLedgerRequest and PENDING status are received', async () => {
    const result = await checkForARLedger([{}], PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when only 0 value mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.value = 0; return x })
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when only AP mockManualLedgerRequests and PENDING status are received', async () => {
    mockManualLedgerRequests.map(x => { x.ledgerPaymentRequest.ledger = AP; return x })
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when an empty manualLedgerRequest and PENDING status are received', async () => {
    const result = await checkForARLedger([{}], PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return PENDING status when mockManualLedgerRequests and PENDING status are received and checkForDebtData returns an object', async () => {
    checkForDebtData.mockReturnValue({ test: 'value does not matter, just that it exists' })
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(PENDING)
  })

  test('should return AWAITING_ENRICHMENT status when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null', async () => {
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(AWAITING_ENRICHMENT)
  })

  test('should return AWAITING_ENRICHMENT status when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is true', async () => {
    config.isAlerting = true
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(AWAITING_ENRICHMENT)
  })

  test('should return AWAITING_ENRICHMENT status when mockManualLedgerRequests and PENDING status are received, checkForDebtData returns null and config.isAlerting is false', async () => {
    config.isAlerting = false
    const result = await checkForARLedger(mockManualLedgerRequests, PENDING)
    expect(result).toBe(AWAITING_ENRICHMENT)
  })
})
