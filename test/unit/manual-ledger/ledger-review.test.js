jest.mock('../../../app/manual-ledger/get-manual-ledger')
const mockGetManualLedger = require('../../../app/manual-ledger/get-manual-ledger')

jest.mock('../../../app/auth/get-user')
const mockGetUser = require('../../../app/auth/get-user')

jest.mock('../../../app/manual-ledger/update-manual-ledger-with-debt-data')
const mockUpdateManualLedgerWithDebtData = require('../../../app/manual-ledger/update-manual-ledger-with-debt-data')

jest.mock('../../../app/event/send-manual-ledger-review-event')
const mockSendManualLedgerReviewEvent = require('../../../app/event/send-manual-ledger-review-event')

jest.mock('../../../app/quality-check/update-quality-checks-status', () => jest.fn())
const mockUpdateQualityChecksStatus = require('../../../app/quality-check/update-quality-checks-status')

jest.mock('../../../app/manual-ledger/reset-manual-ledger', () => jest.fn())
const mockResetManualLedger = require('../../../app/manual-ledger/reset-manual-ledger')

const { ledgerReview } = require('../../../app/manual-ledger/ledger-review')
const { PASSED, FAILED, AWAITING_ENRICHMENT } = require('../../../app/quality-check/statuses')

describe('manual ledger review', () => {
  let request

  beforeEach(() => {
    jest.clearAllMocks()
    request = {
      payload: { status: PASSED, paymentRequestId: 1 },
      auth: { credentials: { account: { homeAccountId: 'df18f8eb-ebd5-483b-9918-6e76fb93ac16' } } }
    }
  })

  describe('when paymentRequestId is missing', () => {
    beforeEach(() => { delete request.payload.paymentRequestId })

    test('does not call getManualLedger', async () => {
      await ledgerReview(request)
      expect(mockGetManualLedger).not.toHaveBeenCalled()
    })

    test('does not call getUser', async () => {
      await ledgerReview(request)
      expect(mockGetUser).not.toHaveBeenCalled()
    })
  })

  describe('getManualLedger and getUser calls', () => {
    test('calls getManualLedger and getUser', async () => {
      await ledgerReview(request)
      expect(mockGetManualLedger).toHaveBeenCalled()
      expect(mockGetUser).toHaveBeenCalled()
    })
  })

  describe('manual ledger update behavior', () => {
    test('does not update if no manual ledger returned', async () => {
      mockGetManualLedger.mockReturnValue(null)
      mockGetUser.mockReturnValue({ userId: request.auth.credentials.account.homeAccountId })
      await ledgerReview(request)
      expect(mockUpdateManualLedgerWithDebtData).not.toHaveBeenCalled()
    })

    test('sends review event if createdById matches even if no ledger data', async () => {
      const userId = request.auth.credentials.account.homeAccountId
      mockGetManualLedger.mockReturnValue({ manualLedgerChecks: [{ createdById: userId }] })
      mockGetUser.mockReturnValue({ userId })
      await ledgerReview(request)
      expect(mockSendManualLedgerReviewEvent).toHaveBeenCalled()
    })

    test('updates ledger if createdById does not match', async () => {
      const userId = request.auth.credentials.account.homeAccountId
      mockGetManualLedger.mockReturnValue({ manualLedgerChecks: [{ createdById: 'other-id' }] })
      mockGetUser.mockReturnValue({ userId })
      await ledgerReview(request)
      expect(mockUpdateManualLedgerWithDebtData).toHaveBeenCalled()
    })
  })

  describe('status-based actions', () => {
    beforeEach(() => {
      mockGetManualLedger.mockReturnValue({ manualLedgerChecks: [{ createdById: 'other-id' }] })
      mockGetUser.mockReturnValue({ userId: request.auth.credentials.account.homeAccountId })
    })

    test.each([
      [FAILED, true, true],
      [AWAITING_ENRICHMENT, true, false],
      [PASSED, false, false]
    ])(
      'status %s calls updateQualityChecksStatus: %s, resetManualLedger: %s',
      async (status, shouldUpdateQC, shouldResetLedger) => {
        request.payload.status = status
        await ledgerReview(request)
        expect(mockUpdateQualityChecksStatus).toHaveBeenCalledTimes(shouldUpdateQC ? 1 : 0)
        expect(mockResetManualLedger).toHaveBeenCalledTimes(shouldResetLedger ? 1 : 0)
      }
    )
  })
})
