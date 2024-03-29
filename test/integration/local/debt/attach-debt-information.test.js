jest.mock('../../../../app/config')
const config = require('../../../../app/config')

const db = require('../../../../app/data')
const { attachDebtInformationIfExists, checkDebts } = require('../../../../app/debt')
const { NOT_READY } = require('../../../../app/quality-check/statuses')

jest.mock('../../../../app/event')
const { sendEnrichRequestBlockedEvent } = require('../../../../app/event')

global.console.log = jest.fn()
let paymentRequestData
let paymentRequest
let debtData
let qualityData
let schemeId
let frn
let reference
let netValue

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true })
}

describe('Attach debt information tests', () => {
  beforeEach(async () => {
    config.isAlerting = true

    await resetData()

    qualityData = {
      qualityCheckId: 1,
      checkedDate: null,
      checkedBy: null,
      status: NOT_READY
    }

    debtData = {
      debtDataId: 2,
      schemeId: null,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 15000,
      debtType: null,
      recoveryDate: null,
      attachedDate: null,
      createdDate: null
    }

    paymentRequestData = {
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      sbi: 123456789,
      paymentRequestNumber: 40,
      agreementNumber: 'SIP00000000000001',
      contractNumber: 'SFIP000001',
      marketingYear: 2022,
      currency: 'GBP',
      schedule: 'M12',
      dueDate: '2015-08-15',
      value: 15000,
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

    await db.debtData.create(debtData)
    await db.qualityCheck.create(qualityData)
    paymentRequest = await db.paymentRequest.create(paymentRequestData)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('Update the debtData table with paymentRequest.paymentRequestId', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].paymentRequestId).toBe(paymentRequest.paymentRequestId)
    expect(debtDataRow[0].attachedDate).not.toBeNull()
    expect(debtDataRow[0].debtDataId).toBe(debtData.debtDataId)
  })

  test('Update the debtData table with paymentRequest.paymentRequestId when debt data found', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].paymentRequestId).toBe(paymentRequest.paymentRequestId)
  })

  test('Update the debtData table with an attachedDate when debt data found', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].attachedDate).not.toBeNull()
  })

  test('debtDataId remains the same when debt data found', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].debtDataId).toBe(debtData.debtDataId)
  })

  test('attachedDate should be a date type', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].attachedDate).toBeInstanceOf(Date)
  })

  test('should call sendEnrichRequestBlockedEvent when no debt data found and isAlerting is true', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalled()
  })

  test('should call sendEnrichRequestBlockedEvent with paymentRequestData with paymentRequestId key when no debt data found and isAlerting is true', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledWith({ ...paymentRequest })
  })

  test('should not call sendEnrichRequestBlockedEvent when no debt data found and isAlerting is false', async () => {
    config.isAlerting = false
    await db.debtData.truncate({ cascade: true })

    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when debt data found and isAlerting is true', async () => {
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when debt data found and isAlerting is false', async () => {
    config.isAlerting = false
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('checkDebts returns an empty object if frn is NaN', async () => {
    schemeId = 1
    frn = 'aaaaaaa'
    reference = paymentRequest.agreementNumber
    netValue = paymentRequest.netValue
    expect(await checkDebts(schemeId, frn, reference, netValue)).toStrictEqual({})
  })
})
