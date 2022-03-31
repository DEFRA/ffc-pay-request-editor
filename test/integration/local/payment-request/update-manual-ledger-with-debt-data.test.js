const db = require('../../../../app/data')
const { updateManualLedgerWithDebtData } = require('../../../../app/manual-ledger')
let scheme
let paymentRequest
let qualityCheck

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
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

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('confirm manual ledger is added to awaiting enrichment when no matching debt-data', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
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
    expect(qualityCheckAfterUpdate.status).toBe('Passed')
  })

  test('confirm manual ledger with no attached debt data searches for matching debt-data and attach found debt-data', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      paymentRequestId: null,
      netValue: 20
    })
    const debtDatakBeforeUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDatakBeforeUpdate.paymentRequestId).toBeNull()
    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const debtDatakAfterUpdate = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtDatakAfterUpdate.paymentRequestId).toBe(1)
  })
})
