const { getQualityChecks } = require('../../../../app/quality-check')
const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { PENDING } = require('../../../../app/quality-check/statuses')

describe('Get quality checks', () => {
  let paymentRequest
  let ledgerPaymentRequest
  let manualLedgerPaymentRequest
  let qualityCheck

  const resetTables = async () => {
    await truncate(['qualityChecks'])
    await truncate(['paymentRequests'])
    await truncate(['schemes'])
  }

  beforeEach(async () => {
    await resetTables()

    const scheme = {
      schemeId: 1,
      name: 'SFI'
    }

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
      ledgerPaymentRequestId: 2,
      active: true,
      original: true
    }

    qualityCheck = {
      paymentRequestId: 1,
      checkedDate: '2015-08-15',
      checkedBy: 'Mr T',
      status: PENDING
    }

    await db.scheme().insert(scheme)

    await db.paymentRequest().insert([
      paymentRequest,
      ledgerPaymentRequest
    ])

    await db.manualLedgerPaymentRequest().insert(
      manualLedgerPaymentRequest
    )

    await db.qualityCheck().insert(qualityCheck)
  })

  afterAll(async () => {
    await resetTables()
    await db.close()
  })

  test('should return correct count for quality checks', async () => {
    const qualityChecks = await getQualityChecks()

    expect(qualityChecks.count).toEqual(1)
  })

  test('should return zero quality check records when tables are empty', async () => {
    await resetTables()

    const qualityChecks = await getQualityChecks()

    expect(qualityChecks.rows).toHaveLength(0)
    expect(qualityChecks.count).toEqual(0)
  })

  test('should return paginated results correctly', async () => {
    const page1 = await getQualityChecks(1, 1)
    const page2 = await getQualityChecks(2, 1)

    expect(page1.rows).toHaveLength(1)
    expect(page1.count).toBe(1)

    expect(page2.rows).toHaveLength(0)
    expect(page2.count).toBe(1)
  })

  test('should return all results when usePagination is false', async () => {
    const qualityChecks = await getQualityChecks(
      1,
      100,
      false
    )

    expect(qualityChecks.rows).toHaveLength(1)
    expect(qualityChecks.count).toBe(1)
  })

  test('should filter by frn when provided', async () => {
    const qualityChecks = await getQualityChecks(
      1,
      100,
      true,
      '1234567890'
    )

    expect(qualityChecks.rows).toHaveLength(1)
    expect(qualityChecks.count).toBe(1)
  })

  test('should return no results for unknown frn', async () => {
    const qualityChecks = await getQualityChecks(
      1,
      100,
      true,
      '9999999999'
    )

    expect(qualityChecks.rows).toHaveLength(0)
    expect(qualityChecks.count).toBe(0)
  })
})
