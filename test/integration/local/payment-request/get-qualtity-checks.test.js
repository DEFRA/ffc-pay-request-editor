const { getQualityChecks, getQualityChecksCount } = require('../../../../app/quality-check')
const db = require('../../../../app/data')
const { PENDING } = require('../../../../app/quality-check/statuses')

describe('Get quality checks test', () => {
  let qualityCheck
  let paymentRequest
  let ledgerPaymentRequest
  let manualLedgerPaymentRequest

  const resetTables = async () => {
    await db.qualityCheck.truncate({ cascade: true })
    await db.paymentRequest.truncate({ cascade: true })
    await db.scheme.truncate({ cascade: true })
  }

  beforeEach(async () => {
    await resetTables()

    const scheme = { schemeId: 1, name: 'SFI' }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: scheme.schemeId,
      frn: 1234567890,
      released: undefined,
      categoryId: 2
    }

    ledgerPaymentRequest = {
      paymentRequestId: 2,
      schemeId: scheme.schemeId,
      frn: 1234567890,
      released: undefined,
      categoryId: 3
    }

    manualLedgerPaymentRequest = {
      paymentRequestId: 1,
      ledgerPaymentRequestId: 2
    }

    qualityCheck = {
      paymentRequestId: 1,
      checkedDate: '2021-08-15',
      checkedBy: 'Mr T',
      status: PENDING
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create(ledgerPaymentRequest)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)

    await db.qualityCheck.create(qualityCheck)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 quality check record', async () => {
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(1)
  })

  test('should return count of 1 for quality check', async () => {
    const qualityCheckCount = await getQualityChecksCount()
    expect(qualityCheckCount).toEqual(1)
  })

  test('should return zero quality check records', async () => {
    await resetTables()
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(0)
  })

  test('should return count of 0 for quality check', async () => {
    await resetTables()
    const qualityCheckCount = await getQualityChecksCount()
    expect(qualityCheckCount).toEqual(0)
  })
})
