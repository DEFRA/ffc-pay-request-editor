jest.mock('../../../../app/config')
const config = require('../../../../app/config')

const db = require('../../../../app/data')
const { attachDebtInformation, checkDebts } = require('../../../../app/debt')
const { NOT_READY } = require('../../../../app/quality-check/statuses')

jest.mock('../../../../app/event')
const { sendEnrichRequestBlockedEvent } = require('../../../../app/event')

global.console.log = jest.fn()
let paymentRequestData
let debtData
let qualityData
let paymentRequestId
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
      debtDataId: 1,
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
      dueDate: '2021-08-15',
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
    const paymentRequest = await db.paymentRequest.create(paymentRequestData)
    paymentRequestId = paymentRequest.paymentRequestId
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('Update the debtData table with data from the payment request', async () => {
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    const debtDataRow = await db.debtData.findAll()
    const logSpy = jest.spyOn(console, 'log')
    expect(logSpy).toHaveBeenCalledWith('debt data updated')
    expect(debtDataRow[0].paymentRequestId).toBe(paymentRequestId)
    expect(debtDataRow[0].attachedDate).not.toBeNull()
    expect(debtDataRow[0].debtDataId).toBe(debtData.debtDataId)
  })

  test('attachedDate should be a date type', async () => {
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    const debtDataRow = await db.debtData.findAll()
    expect(debtDataRow[0].attachedDate).toBeInstanceOf(Date)
  })

  test('If no debt data found, log message to console', async () => {
    await db.debtData.destroy({
      where: {
        debtDataId: 1
      }
    })
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    const logSpy = jest.spyOn(console, 'log')
    expect(logSpy).toHaveBeenCalledWith('no debt data found')
  })

  test('should call sendEnrichRequestBlockedEvent when no debt data found and isAlerting is true', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalled()
  })

  test('should call sendEnrichRequestBlockedEvent with paymentRequestData when no debt data found and isAlerting is true', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledWith(paymentRequestData)
  })

  test('should not call sendEnrichRequestBlockedEvent when no debt data found and isAlerting is false', async () => {
    config.isAlerting = false
    await db.debtData.truncate({ cascade: true })

    await attachDebtInformation(paymentRequestId, paymentRequestData)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when debt data found and isAlerting is true', async () => {
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendEnrichRequestBlockedEvent when debt data found and isAlerting is false', async () => {
    config.isAlerting = false
    await attachDebtInformation(paymentRequestId, paymentRequestData)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('checkDebts returns an empty object if frn is NaN', async () => {
    frn = 'aaaaaaa'
    reference = paymentRequestData.agreementNumber
    netValue = paymentRequestData.netValue
    expect(await checkDebts(frn, reference, netValue)).toStrictEqual({})
  })
})
