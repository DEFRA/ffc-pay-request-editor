const db = require('../../../../app/data')
const { updateManualLedgerWithDebtData, attachDebtToManualLedger } = require('../../../../app/manual-ledger')
const { AR, AP } = require('../../../../app/processing/ledger/ledgers')
const { PENDING, PASSED } = require('../../../../app/quality-check/statuses')

let scheme
let paymentRequest
let qualityCheck
let manualLedgerPaymentRequest

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.manualLedgerPaymentRequest.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('process payment requests', () => {
  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

    paymentRequest = {
      paymentRequestId: 1,
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      sbi: 123456789,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      contractNumber: 'SFIP000001',
      marketingYear: 2022,
      currency: 'GBP',
      schedule: 'M12',
      dueDate: '2021-08-15',
      value: 2000,
      netValue: 3000,
      categoryId: 2,
      invoiceLines: [
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          description: 'G00 - Gross value of claim',
          value: 25000
        },
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          description: 'P02 - Over declaration penalty',
          value: -10000
        }
      ]
    }

    qualityCheck = {
      qualityCheckId: 1,
      paymentRequestId: 1,
      status: 'Pending'
    }

    manualLedgerPaymentRequest = {
      paymentRequestId: 1,
      ledgerPaymentRequestId: 1,
      active: true,
      original: true
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('confirm manual ledger is not added to awaiting enrichment when no matching debt-data but there is no ledger = AR ', async () => {
    paymentRequest.ledger = AP
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 1500
    })
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const paymentRequestAfterUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestAfterUpdate.categoryId).toBe(2)
  })

  test('confirm manual ledger is added to awaiting enrichment when no matching debt-data and there is ledger is AR', async () => {
    paymentRequest.ledger = AR
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 1500
    })
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const paymentRequestAfterUpdate = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestAfterUpdate.categoryId).toBe(1)
  })

  test('confirm manual ledger is published to ffc-pay-quality-check if debt data is already attached', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: 1,
      netValue: 15000
    })
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const qualityCheckAfterUpdate = await db.qualityCheck.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(qualityCheckAfterUpdate.status).toBe(PASSED)
  })

  test('confirm manual ledger with no attached debt data searches for matching debt-data and attach found debt-data when there is ledger AR', async () => {
    paymentRequest.ledger = AR
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 30
    })
    const debtDataBeforeUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDataBeforeUpdate.paymentRequestId).toBeNull()
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const debtDataAfterUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDataAfterUpdate.paymentRequestId).toBe(1)
  })

  test('confirm manual ledger with no attached debt data do not search for matching debt-data when there is no ledger AR', async () => {
    paymentRequest.ledger = AP
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 30
    })
    const debtDataBeforeUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDataBeforeUpdate.paymentRequestId).toBeNull()
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const debtDataAfterUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDataAfterUpdate.paymentRequestId).toBeNull()
  })

  test('confirm manual ledger is published to ffc-pay-quality-check if debt data is already attached and there is ledger AR', async () => {
    paymentRequest.ledger = AR
    await db.paymentRequest.create(paymentRequest)
    qualityCheck.status = PENDING
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: 1,
      netValue: 30
    })
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const qualityCheckAfterUpdate = await db.qualityCheck.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(qualityCheckAfterUpdate.status).toBe(PASSED)
  })

  test('confirm manual ledger is published to ffc-pay-quality-check if no manualledgerPayRequest', async () => {
    await db.paymentRequest.create(paymentRequest)
    qualityCheck.status = PENDING
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 30
    })
    await updateManualLedgerWithDebtData(2)
    const qualityCheckAfterUpdate = await db.qualityCheck.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(qualityCheckAfterUpdate.status).toBe(PENDING)
  })

  test('confirm  debt data is attached to manualledgerPayRequest', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: 1,
      debtType: 'adm'
    })

    const paymentRequestBeforeDebtAttachment = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(paymentRequestBeforeDebtAttachment.debtType).toBe(undefined)
    await attachDebtToManualLedger(paymentRequestBeforeDebtAttachment)
    expect(paymentRequestBeforeDebtAttachment.debtType).toBe('adm')
  })
})
