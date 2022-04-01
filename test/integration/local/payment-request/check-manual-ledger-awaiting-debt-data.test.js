const db = require('../../../../app/data')
const { isManualLedgerAwaitingDebtData } = require('../../../../app/manual-ledger')
const { AWAITING_ENRICHMENT } = require('../../../../app/quality-check/statuses')
let scheme
let paymentRequest
let qualityCheck

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
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
    await db.sequelize.close()
  })

  test('confirm record is not returned when status is not  Awaiting-Enrichment', async () => {
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    const inManualLedgerAwaitingDebtData = await isManualLedgerAwaitingDebtData(paymentRequest.paymentRequestId)
    expect(inManualLedgerAwaitingDebtData).toBeNull()
  })

  test('confirm record is returned when status is Awaiting-Enrichment', async () => {
    qualityCheck.status = AWAITING_ENRICHMENT
    await db.paymentRequest.create(paymentRequest)
    await db.qualityCheck.create(qualityCheck)
    const inManualLedgerAwaitingDebtData = await isManualLedgerAwaitingDebtData(paymentRequest.paymentRequestId)
    expect(inManualLedgerAwaitingDebtData).not.toBeNull()
  })
})
