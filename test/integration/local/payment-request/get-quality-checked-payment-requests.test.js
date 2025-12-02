const db = require('../../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../../app/quality-check')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { IRREGULAR } = require('../../../../app/constants/debt-types')
const { PASSED } = require('../../../../app/quality-check/statuses')

const resetData = async () => {
  await db.invoiceLine.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
  await db.manualLedgerPaymentRequest.truncate({ cascade: true })
  await db.qualityCheck.truncate({ cascade: true })
}

describe('getQualityCheckedPaymentRequests', () => {
  let basePaymentRequest
  let provisional
  let qualityCheck

  beforeEach(async () => {
    await resetData()

    await db.scheme.create({
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
    })

    basePaymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: null,
      categoryId: 2
    }

    provisional = {
      paymentRequestId: 2,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: null,
      categoryId: 3
    }

    qualityCheck = {
      paymentRequestId: 1,
      status: PASSED
    }

    await db.paymentRequest.bulkCreate([basePaymentRequest, provisional])

    await db.manualLedgerPaymentRequest.create({
      paymentRequestId: 1,
      ledgerPaymentRequestId: 2,
      active: true,
      original: true
    })

    await db.debtData.create({
      paymentRequestId: 1,
      debtType: IRREGULAR,
      recoveryDate: '10/11/2015'
    })

    await db.invoiceLine.create({
      paymentRequestId: 1,
      value: 10000
    })

    await db.qualityCheck.create(qualityCheck)
  })

  test('returns one released payment request when QC status is PASSED', async () => {
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(1)
  })

  test('returned item contains base paymentRequest (ID=1) and its provisional (ID=2)', async () => {
    const [row] = await getQualityCheckedPaymentRequests()
    expect(row.paymentRequest.paymentRequestId).toBe(1)
    expect(row.paymentRequests[0].paymentRequestId).toBe(2)
  })

  test('returns no results when there are no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })

  test('returns no results when QC status is not PASSED', async () => {
    await db.qualityCheck.truncate({ cascade: true })
    await db.qualityCheck.create({ ...qualityCheck, status: 'Not started' })
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })

  test('returns no results when categoryId is not 2', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    await db.paymentRequest.create({ ...basePaymentRequest, categoryId: 1 })
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })
})
