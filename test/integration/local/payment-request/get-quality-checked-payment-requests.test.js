const db = require('../../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../../app/quality-check')

const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { IRREGULAR } = require('../../../../app/debt-types')

const resetData = async () => {
  await db.invoiceLine.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Get released payment request test', () => {
  let paymentRequest
  let provisionalPaymentRequest
  let debtData
  let manualLedgerPaymentRequest
  let qualityCheck

  beforeEach(async () => {
    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
    }

    const invoiceLine = {
      paymentRequestId: 1,
      value: 10000
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: SCHEME_ID_SFI_PILOT,
      frn: 1234567890,
      released: undefined,
      categoryId: 2
    }

    provisionalPaymentRequest = {
      paymentRequestId: 2,
      schemeId: SCHEME_ID_SFI_PILOT,
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
      status: 'Passed'
    }

    debtData = {
      paymentRequestId: 1,
      debtType: IRREGULAR,
      recoveryDate: '10/11/2021'
    }

    await resetData()
    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)
    await db.paymentRequest.create(provisionalPaymentRequest)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create(debtData)
    await db.invoiceLine.create(invoiceLine)
    await db.qualityCheck.create(qualityCheck)
  })

  test('should return 1 payment request record when status is passed', async () => {
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(1)
  })

  test('should return one paymentRequest record with paymentRequestId of 1', async () => {
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests[0].paymentRequest.paymentRequestId).toBe(1)
  })

  test('should return one paymentRequest record with a paymentRequestId of 2 for provisionalPaymentRequest', async () => {
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests[0].paymentRequests[0].paymentRequestId).toBe(2)
  })

  test('should return 0 payment request records when no payment requests', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when status is not "Passed"', async () => {
    await db.qualityCheck.truncate({ cascade: true })
    qualityCheck.status = 'Not started'
    await db.qualityCheck.create(qualityCheck)
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })

  test('should return 0 payment request record when categoryId != 2', async () => {
    await db.paymentRequest.truncate({ cascade: true })
    paymentRequest.categoryId = 1
    await db.paymentRequest.create(paymentRequest)
    const paymentRequests = await getQualityCheckedPaymentRequests()
    expect(paymentRequests).toHaveLength(0)
  })
})
