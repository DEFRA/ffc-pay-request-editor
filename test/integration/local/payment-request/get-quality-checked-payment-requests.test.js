const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { getQualityCheckedPaymentRequests } = require('../../../../app/quality-check')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { IRREGULAR } = require('../../../../app/constants/debt-types')
const { PASSED } = require('../../../../app/quality-check/statuses')

const resetData = async () => {
  await truncate(['invoiceLines'])
  await truncate(['schemes'])
  await truncate(['debtData'])
  await truncate(['paymentRequests'])
  await truncate(['manualLedgerPaymentRequest'])
  await truncate(['qualityChecks'])
}

describe('getQualityCheckedPaymentRequests', () => {
  let basePaymentRequest
  let provisional
  let qualityCheck

  beforeEach(async () => {
    await resetData()

    await db.scheme().insert({
      schemeId: SCHEME_ID_SFI_PILOT,
      name: SCHEME_NAME_SFI_PILOT
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

    await db.paymentRequest().insert([basePaymentRequest, provisional])

    await db.manualLedgerPaymentRequest().insert({
      paymentRequestId: 1,
      ledgerPaymentRequestId: 2,
      active: true,
      original: true
    })

    await db.debtData().insert({
      paymentRequestId: 1,
      debtType: IRREGULAR,
      recoveryDate: '10/11/2015'
    })

    await db.invoiceLine().insert({
      paymentRequestId: 1,
      value: 10000
    })

    await db.qualityCheck().insert(qualityCheck)
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
    await truncate(['paymentRequests'])
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })

  test('returns no results when QC status is not PASSED', async () => {
    await truncate(['qualityChecks'])
    await db.qualityCheck().insert({ ...qualityCheck, status: 'Not started' })
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })

  test('returns no results when categoryId is not 2', async () => {
    await truncate(['paymentRequests'])
    await db.paymentRequest().insert({ ...basePaymentRequest, categoryId: 1 })
    const result = await getQualityCheckedPaymentRequests()
    expect(result).toHaveLength(0)
  })
})
