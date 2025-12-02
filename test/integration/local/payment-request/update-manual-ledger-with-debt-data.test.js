const mockSendEvent = jest.fn()
const mockPublishEvent = jest.fn()

const MockPublishEvent = jest.fn().mockImplementation(() => ({ sendEvent: mockSendEvent }))
const MockEventPublisher = jest.fn().mockImplementation(() => ({ publishEvent: mockPublishEvent }))

jest.mock('ffc-pay-event-publisher', () => ({
  PublishEvent: MockPublishEvent,
  EventPublisher: MockEventPublisher
}))

const db = require('../../../../app/data')
const { updateManualLedgerWithDebtData, attachDebtToManualLedger } = require('../../../../app/manual-ledger')
const { AR, AP } = require('../../../../app/processing/ledger/ledgers')
const { PENDING } = require('../../../../app/quality-check/statuses')
const { SCHEME_ID_SFI_PILOT } = require('../../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../../data/scheme')
const { ADMINISTRATIVE } = require('../../../../app/constants/debt-types')
const { convertDateToDDMMYYYY } = require('../../../../app/processing/conversion')

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

const recoveryDate = () => {
  const date = new Date()
  return convertDateToDDMMYYYY(date.getDate(), date.getMonth(), date.getYear())
}

describe('Manual Ledger Processing', () => {
  beforeEach(async () => {
    await resetData()

    scheme = { schemeId: SCHEME_ID_SFI_PILOT, name: SCHEME_NAME_SFI_PILOT }
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
      dueDate: '2015-08-15',
      value: 2000,
      netValue: 3000,
      categoryId: 2,
      invoiceLines: [
        { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'G00 - Gross value of claim', value: 25000 },
        { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'P02 - Over declaration penalty', value: -10000 }
      ]
    }

    qualityCheck = { qualityCheckId: 1, paymentRequestId: 1, status: PENDING }
    manualLedgerPaymentRequest = { paymentRequestId: 1, ledgerPaymentRequestId: 1, active: true, original: true }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test.each([
    [AP, 2, 'manual ledger not updated when ledger is AP'],
    [AR, 4, 'manual ledger updated when ledger is AR and matching debt-data exists']
  ])('manual ledger updates correctly for ledger %s', async (ledger, expectedCategoryId, description) => {
    paymentRequest.ledger = ledger
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({ debtDataId: 1, frn: 1234567890, reference: 'SIP00000000000001', paymentRequestId: ledger === AR ? null : 1, netValue: 1500, debtType: ledger === AR ? ADMINISTRATIVE : undefined, recoveryDate: recoveryDate() })

    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const updatedPR = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(updatedPR.categoryId).toBe(expectedCategoryId)
  })

  test('manual ledger is published to ffc-pay-quality-check if debt data is already attached', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.debtData.create({ debtDataId: 1, frn: 1234567890, reference: 'SIP00000000000001', paymentRequestId: 1, netValue: 15000 })

    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)
    const qcAfterUpdate = await db.qualityCheck.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(qcAfterUpdate.status).toBe(PENDING)
  })

  test('manual ledger attaches debt data when ledger is AR', async () => {
    paymentRequest.ledger = AR
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({ debtDataId: 1, frn: 1234567890, reference: 'SIP00000000000001', paymentRequestId: null, netValue: 3000, debtType: ADMINISTRATIVE, recoveryDate: recoveryDate() })

    const debtBefore = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtBefore.paymentRequestId).toBeNull()

    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)

    const debtAfter = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtAfter.paymentRequestId).toBe(1)
  })

  test('manual ledger does not attach debt data when ledger is not AR', async () => {
    paymentRequest.ledger = AP
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({ debtDataId: 1, frn: 1234567890, reference: 'SIP00000000000001', paymentRequestId: null, netValue: 3000 })

    const debtBefore = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtBefore.paymentRequestId).toBeNull()

    await updateManualLedgerWithDebtData(paymentRequest.paymentRequestId)

    const debtAfter = await db.debtData.findOne({ where: { debtDataId: 1 } })
    expect(debtAfter.paymentRequestId).toBeNull()
  })

  test('attaches debt type to manual ledger payment request', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    await db.manualLedgerPaymentRequest.create(manualLedgerPaymentRequest)
    await db.debtData.create({ debtDataId: 1, frn: 1234567890, reference: 'SIP00000000000001', paymentRequestId: 1, netValue: 3000, debtType: ADMINISTRATIVE, recoveryDate: recoveryDate() })

    const prBefore = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(prBefore.debtType).toBe(undefined)

    await attachDebtToManualLedger({ paymentRequest: prBefore })
    expect(prBefore.debtType).toBe(ADMINISTRATIVE)
  })
})
