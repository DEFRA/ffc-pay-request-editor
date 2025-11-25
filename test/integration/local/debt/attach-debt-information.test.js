jest.mock('../../../../app/config')
const config = require('../../../../app/config')

jest.mock('../../../../app/event')
const { sendEnrichRequestBlockedEvent } = require('../../../../app/event')

const db = require('../../../../app/data')
const {
  attachDebtInformationIfExists,
  checkDebts
} = require('../../../../app/debt')

const { mockDebt1, mockQuality, mockRequest } = require('../../../mocks/debt-information')

global.console.log = jest.fn()

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true })
}

describe('attachDebtInformationIfExists', () => {
  let paymentRequest

  beforeEach(async () => {
    config.isAlerting = true

    await resetData()

    await db.debtData.create(mockDebt1)
    await db.qualityCheck.create(mockQuality)
    paymentRequest = await db.paymentRequest.create(mockRequest)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  const runAndFetch = async () => {
    await attachDebtInformationIfExists(paymentRequest)
    return db.debtData.findAll()
  }

  test('updates paymentRequestId and attachedDate when debt exists', async () => {
    const [row] = await runAndFetch()
    expect(row.paymentRequestId).toBe(paymentRequest.paymentRequestId)
    expect(row.attachedDate).not.toBeNull()
    expect(row.debtDataId).toBe(mockDebt1.debtDataId)
  })

  test('attachedDate is a Date instance', async () => {
    const [row] = await runAndFetch()
    expect(row.attachedDate).toBeInstanceOf(Date)
  })

  test('calls sendEnrichRequestBlockedEvent when no debt and alerting enabled', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalled()
  })

  test('calls sendEnrichRequestBlockedEvent with paymentRequest spread', async () => {
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).toHaveBeenCalledWith({ ...paymentRequest })
  })

  test('does not call sendEnrichRequestBlockedEvent when alerting disabled', async () => {
    config.isAlerting = false
    await db.debtData.truncate({ cascade: true })
    await attachDebtInformationIfExists(paymentRequest)
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('does not call sendEnrichRequestBlockedEvent when debt exists', async () => {
    await runAndFetch()
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })

  test('does not call sendEnrichRequestBlockedEvent when debt exists and alerting disabled', async () => {
    config.isAlerting = false
    await runAndFetch()
    expect(sendEnrichRequestBlockedEvent).not.toHaveBeenCalled()
  })
})

describe('checkDebts', () => {
  test.each([
    ['aaaaaaa'],
    ['not-a-number'],
    [undefined],
    [null]
  ])('returns empty object when FRN is invalid (%s)', async frn => {
    const result = await checkDebts(1, frn, 'REF', 100)
    expect(result).toStrictEqual({})
  })
})
