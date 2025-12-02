const { getQualityChecks, getQualityChecksCount } = require('../../../../app/quality-check')
const db = require('../../../../app/data')
const { PENDING } = require('../../../../app/quality-check/statuses')

describe('Get quality checks', () => {
  let paymentRequest
  let ledgerPaymentRequest
  let manualLedgerPaymentRequest
  let qualityCheck

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
      checkedDate: '2015-08-15',
      checkedBy: 'Mr T',
      status: PENDING
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.bulkCreate([paymentRequest, ledgerPaymentRequest])
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.qualityCheck.create(qualityCheck)
  })

  afterAll(async () => {
    await resetTables()
    await db.sequelize.close()
  })

  test('should return 1 quality check record with updated scheme name', async () => {
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(1)
    expect(qualityChecks[0].paymentRequest.schemes.name).toBe('SFI22')
  })

  test('should return correct count for quality checks', async () => {
    const count = await getQualityChecksCount()
    expect(count).toEqual(1)
  })

  test('should return zero quality check records when tables are empty', async () => {
    await resetTables()
    const qualityChecks = await getQualityChecks()
    const count = await getQualityChecksCount()
    expect(qualityChecks).toHaveLength(0)
    expect(count).toEqual(0)
  })
})
