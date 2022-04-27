const db = require('../../../app/data')
const { SCHEME_ID_SFI } = require('../../data/scheme-id')
const { getChangedQualityChecks } = require('../../../app/quality-check')
describe('Get changed quality check tests', () => {
  let paymentRequest

  const resetTables = async () => {
    await db.manualLedgerPaymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
    await db.scheme.truncate({ cascade: true })
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

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 2 })
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 3 })
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 4 })
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 5 })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: false, original: true })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 1, ledgerPaymentRequestId: 3, active: true, original: false })
    await db.manualLedgerPaymentRequest.create({ paymentRequestId: 4, ledgerPaymentRequestId: 5, active: true, original: false })
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return hasDismissed as yes with paymentRequestId of 1', async () => {
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

  test('should return hasDismissed as no with paymentRequestId of 5', async () => {
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

  test('should return hasDismissed as no with paymentRequestId of 4 and "active" is true', async () => {
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
