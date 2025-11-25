jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/auth')

const { enrichment } = require('../../../../app/auth/permissions')
const db = require('../../../../app/data')
const mockAuth = require('../../../../app/auth')
const createServer = require('../../../../app/server')

const mockSendEvent = jest.fn()
const mockPublishEvent = jest.fn()
const MockPublishEvent = jest.fn().mockImplementation(() => ({ sendEvent: mockSendEvent }))
const MockEventPublisher = jest.fn().mockImplementation(() => ({ publishEvent: mockPublishEvent }))

jest.mock('ffc-pay-event-publisher', () => ({
  PublishEvent: MockPublishEvent,
  EventPublisher: MockEventPublisher
}))

const { SCHEME_ID_SFI } = require('../../../data/scheme-id')
const { ADMINISTRATIVE } = require('../../../../app/constants/debt-types')
const { PENDING, NOT_READY } = require('../../../../app/quality-check/statuses')
const { AR, AP } = require('../../../../app/processing/ledger/ledgers')

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Enrich request tests', () => {
  let server

  const user = { userId: '1', username: 'Developer' }
  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }

  const paymentRequest = {
    sourceSystem: 'SFIP',
    schemeId: 1,
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
    dueDate: '2015-10-25',
    value: 15000,
    received: '2015-10-25',
    invoiceLines: [
      { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'G00 - Gross value of claim', value: 25000 },
      { schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'P02 - Over declaration penalty', value: -10000 }
    ]
  }

  const scheme = { schemeId: 1, name: 'SFI' }
  const qualityCheck = { qualityCheckId: 1, paymentRequestId: 1, checkedDate: null, checkedBy: null, status: NOT_READY }

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    await resetData()
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  describe('GET /enrich-request', () => {
    const method = 'GET'

    test.each([
      { query: '', template: '404' },
      { query: '?paymentRequestId=1', template: '404' },
      { query: '?invoiceNumber=S00000001SFIP000001V001', template: '404' }
    ])('returns 404 view when missing query params', async ({ query, template }) => {
      const response = await server.inject({ method, url: `/enrich-request${query}`, auth })
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe(template)
    })

    test.each([
      { released: new Date(), expectedTemplate: '404' },
      { released: undefined, ledger: AR, expectedTemplate: 'enrich-request' },
      { released: undefined, ledger: AP, expectedTemplate: 'enrich-request' }
    ])('handles query with invoiceNumber and paymentRequestId', async ({ released, ledger, expectedTemplate }) => {
      const url = '/enrich-request?invoiceNumber=S00000001SFIP000001V001&paymentRequestId=1'
      paymentRequest.released = released
      if (ledger) paymentRequest.ledger = ledger

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject({ method, url, auth })
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe(expectedTemplate)
    })

    test('returns 404 if no matching paymentRequestId or invoiceNumber', async () => {
      const url1 = '/enrich-request?invoiceNumber=S00000001SFIP000001V001&paymentRequestId=3'
      const url2 = '/enrich-request?invoiceNumber=S00000001SFIP000001V002&paymentRequestId=1'

      paymentRequest.released = undefined
      paymentRequest.ledger = AR
      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const resp1 = await server.inject({ method, url: url1, auth })
      const resp2 = await server.inject({ method, url: url2, auth })

      expect(resp1.request.response.source.template).toBe('404')
      expect(resp2.request.response.source.template).toBe('404')
    })
  })

  describe('POST /enrich-request', () => {
    const method = 'POST'

    test('redirects to /enrich if already released', async () => {
      const payload = { day: 16, month: 10, year: 2015, 'debt-type': ADMINISTRATIVE, 'invoice-number': paymentRequest.invoiceNumber, 'payment-request-id': 1 }
      paymentRequest.released = new Date()
      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject({ method, url: '/enrich-request', payload, auth })
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/enrich')
    })

    test('displays validation errors when input missing', async () => {
      const payload = { 'invoice-number': paymentRequest.invoiceNumber, 'payment-request-id': 1 }
      paymentRequest.released = undefined
      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject({ method, url: '/enrich-request', payload, auth })
      const model = response.request.response.source.context.model
      expect(response.request.response.statusCode).toBe(400)
      expect(model.errorMessage.titleText).toBe('There is a problem')
      expect(model.errorMessage.errorList.map(e => e.message)).toEqual([
        '"day" is required',
        '"month" is required',
        '"year" is required',
        '"debt-type" is required'
      ])
      expect(model.radio.errorMessage.text).toBe('Select a type of debt')
      expect(model.date.errorMessage.text).toBe('The date submitted is not valid')
    })

    test('displays error when date is in the future', async () => {
      const payload = { day: 2, month: 3, year: 4000, 'debt-type': ADMINISTRATIVE, 'invoice-number': paymentRequest.invoiceNumber, 'payment-request-id': 1 }
      paymentRequest.released = undefined
      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject({ method, url: '/enrich-request', payload, auth })
      expect(response.request.response.statusCode).toBe(400)
      expect(response.request.response.source.context.model.date.errorMessage.text).toBe('Date cannot be after 25 10 2015')
    })

    test.each([
      { day: 1, month: 9, expectedDate: '01/09/2015' },
      { day: 12, month: 10, expectedDate: '12/10/2015' }
    ])('saves debt data and redirects for day $day month $month', async ({ day, month, expectedDate }) => {
      const payload = { day, month, year: 2015, 'debt-type': ADMINISTRATIVE, 'invoice-number': paymentRequest.invoiceNumber, 'payment-request-id': 1 }
      paymentRequest.released = undefined
      paymentRequest.ledger = AR
      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)
      await db.qualityCheck.create(qualityCheck)

      const response = await server.inject({ method, url: '/enrich-request', payload, auth })
      const debtRow = await db.debtData.findOne({ where: { debtDataId: 1 } })
      const qcRow = await db.qualityCheck.findOne({ where: { paymentRequestId: 1 } })

      expect(qcRow.status).toBe(PENDING)
      expect(debtRow.paymentRequestId).toBe(1)
      expect(debtRow.schemeId).toBe(SCHEME_ID_SFI)
      expect(parseInt(debtRow.frn)).toBe(1234567890)
      expect(debtRow.debtType).toBe(ADMINISTRATIVE)
      expect(debtRow.recoveryDate).toBe(expectedDate)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/enrich')
    })
  })
})
