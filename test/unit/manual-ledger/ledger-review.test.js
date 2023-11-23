jest.mock('../../../app/manual-ledger/get-manual-ledger')
const mockGetManualLedger = require('../../../app/manual-ledger/get-manual-ledger')
jest.mock('../../../app/auth/get-user')
const mockGetUser = require('../../../app/auth/get-user')
jest.mock('../../../app/manual-ledger/update-manual-ledger-with-debt-data')
const mockUpdateManualLedgerWithDebtData = require('../../../app/manual-ledger/update-manual-ledger-with-debt-data')
jest.mock('../../../app/event/send-manual-ledger-review-event')
const mockSendManualLedgerReviewEvent = require('../../../app/event/send-manual-ledger-review-event')
jest.mock('../../../app/quality-check/update-quality-checks-status')
const mockUpdateQualityChecksStatus = require('../../../app/quality-check/update-quality-checks-status')
jest.mock('../../../app/manual-ledger/reset-manual-ledger')
const mockResetManualLedger = require('../../../app/manual-ledger/reset-manual-ledger')

const { ledgerReview } = require('../../../app/manual-ledger/ledger-review')

const { PASSED, FAILED, AWAITING_ENRICHMENT } = require('../../../app/quality-check/statuses')

describe('manual ledger review test', () => {
  let request

  beforeEach(async () => {
    request = {
      payload: {
        status: PASSED,
        paymentRequestId: 1
      },
      auth: {
        credentials: {
          account: {
            homeAccountId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
          }
        }
      }
    }
  })

  test('if no payment request id, no get manual ledger function called', async () => {
    delete request.payload.paymentRequestId
    await ledgerReview(request)
    expect(mockGetManualLedger).not.toHaveBeenCalled()
  })

  test('if no payment request id, no get user function called', async () => {
    delete request.payload.paymentRequestId
    await ledgerReview(request)
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  test('get manual ledger function called', async () => {
    await ledgerReview(request)
    expect(mockGetManualLedger).toHaveBeenCalled()
  })

  test('get user function called', async () => {
    await ledgerReview(request)
    expect(mockGetUser).toHaveBeenCalled()
  })

  test('if no manual ledger in the DB, update manual ledger with debt data is not called', async () => {
    mockGetManualLedger.mockReturnValue(null)
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockUpdateManualLedgerWithDebtData).not.toHaveBeenCalled()
  })

  test('if no manual ledger in the DB but createdById matches, sendManualLedgerReviewEvent is still called', async () => {
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockSendManualLedgerReviewEvent).toHaveBeenCalled()
  })

  test('if manual ledger in the DB but id matches, update manual ledger with debt data is not called', async () => {
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockUpdateManualLedgerWithDebtData).not.toHaveBeenCalled()
  })

  test('if manual ledger in the DB and id does not match, update manual ledger with debt data is called', async () => {
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'tr18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockUpdateManualLedgerWithDebtData).toHaveBeenCalled()
  })

  test('if manual ledger in the DB, update quality checks status is called if status is failed', async () => {
    request.payload.status = FAILED
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'tr18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockUpdateQualityChecksStatus).toHaveBeenCalled()
  })

  test('if manual ledger in the DB, reset manual ledger is called if status is failed', async () => {
    request.payload.status = FAILED
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'tr18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockResetManualLedger).toHaveBeenCalled()
  })

  test('if manual ledger in the DB, update quality checks status is called assuming status is anything else', async () => {
    request.payload.status = AWAITING_ENRICHMENT
    mockGetManualLedger.mockReturnValue({
      manualLedgerChecks: [{
        createdById: 'tr18f8eb-ebd5-483b-9918-6e76fb93ac16'
      }]
    })
    mockGetUser.mockReturnValue({
      userId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16'
    })
    await ledgerReview(request)
    expect(mockUpdateQualityChecksStatus).toHaveBeenCalled()
  })
})
