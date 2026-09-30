const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const { getChangedQualityChecks } = require('../../../app/quality-check')
describe('Get changed quality check tests', () => {
  let paymentRequest

  const resetTables = async () => {
    await truncate(['manualLedgerPaymentRequest'])
    await truncate(['paymentRequests'])
    await truncate(['schemes'])
  }

  beforeEach(async () => {
    await resetTables()
    const scheme = { schemeId: 1, name: 'SFI' }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI,
      frn: 1234567890,
      categoryId: SCHEME_ID_SFI
    }

    await db.scheme().insert(scheme)
    await db.paymentRequest().insert(paymentRequest)
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 2 })
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 3 })
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 4 })
    await db.paymentRequest().insert({ ...paymentRequest, paymentRequestId: 5 })
    await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: false, original: true })
    await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 1, ledgerPaymentRequestId: 3, active: true, original: false })
    await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 4, ledgerPaymentRequestId: 5, active: true, original: false })
  })

  afterAll(async () => {
    await resetTables()
    await db.close()
  })

  test('should return hasDismissed as "Yes" when paymentRequest exists and matching manualLedgerPaymentRequest exists with active set to false', async () => {
    const qualityChecks = [
      {
        frn: 1234567890,
        paymentRequest: {
          paymentRequestId: 1
        }
      }]
    const changedQualityCheck = await getChangedQualityChecks(qualityChecks)
    expect(changedQualityCheck[0].hasDismissed).toBe('Yes')
  })

  test('should return hasDismissed as "No" when paymentRequest exists and no matching manualLedgerPaymentRequest exists', async () => {
    const qualityChecks = [
      {
        frn: 1234567890,
        paymentRequest: {
          paymentRequestId: 5
        }
      }]
    const changedQualityCheck = await getChangedQualityChecks(qualityChecks)
    expect(changedQualityCheck[0].hasDismissed).toBe('No')
  })

  test('should return hasDismissed as "No" when paymentRequest and matching manualLedgerPaymentRequest exist, with active set to true', async () => {
    const qualityChecks = [
      {
        frn: 1234567890,
        paymentRequest: {
          paymentRequestId: 4
        }
      }]
    const changedQualityCheck = await getChangedQualityChecks(qualityChecks)
    expect(changedQualityCheck[0].hasDismissed).toBe('No')
  })
})
