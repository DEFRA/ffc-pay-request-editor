const { ledger } = require('../../../../app/auth/permissions')

describe('Manual-ledger-check tests', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  jest.mock('../../../../app/event')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  jest.mock('../../../../app/auth/get-user')
  const mockGetUser = require('../../../../app/auth/get-user')
  jest.mock('../../../../app/session-handler')
  const mockSessionHandler = require('../../../../app/session-handler')
  const { getManualLedgers, getManualLedger, calculateManualLedger } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  const method = 'GET'
  const manualLedgerCheckUrl = '/manual-ledger-check'

  let server
  let paymentRequest

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    mockAuth.getUser.mockResolvedValue(user)
    mockGetUser.mockResolvedValue(user)

    mockSessionHandler.get.mockReturnValue({ provisionalLedgerData: {} })

    getManualLedgers.mockResolvedValue([{
      paymentRequest: {
        frn: '1234567890'
      }
    }
    ])

    paymentRequest = {
      paymentRequestId: 1,
      manualLedgerChecks: []
    }
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })

  describe('GET /manual-ledger-check requests', () => {
    test('GET /manual-ledger-check returns manual-ledger-check view', async () => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const options = {
        method,
        auth,
        url: `${manualLedgerCheckUrl}?paymentrequestid=${paymentRequest.paymentRequestId}`
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })

    test('GET /manual-ledger-check with no manual Ledger data returns 404 view', async () => {
      getManualLedger.mockResolvedValue(null)
      const options = {
        method,
        auth,
        url: `${manualLedgerCheckUrl}?paymentrequestid=${paymentRequest.paymentRequestId}`
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
    })

    test('GET /manual-ledger-check with no paymentRequestId returns 404 view', async () => {
      const options = {
        method,
        auth,
        url: manualLedgerCheckUrl
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
    })
  })

  describe('GET /manual-ledger-check/calculate  requests', () => {
    const method = 'GET'
    const manualLedgerCalculateUrl = '/manual-ledger-check/calculate'

    test('GET /manual-ledger-check/calculate with no paymentRequestId returns 404 view', async () => {
      const options = {
        method,
        auth,
        url: manualLedgerCalculateUrl
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
      expect(response.statusCode).toBe(400)
    })

    test.each([
      { paymentRequestId: null, arValue: null, apValue: null },
      { paymentRequestId: 1, arValue: null, apValue: null },
      { paymentRequestId: 1, arValue: 2, apValue: null },
      { paymentRequestId: 1, arValue: null, apValue: 3 },
      { paymentRequestId: 'a', arValue: 2, apValue: 3 },
      { paymentRequestId: 1, arValue: 'b', apValue: 3 },
      { paymentRequestId: 1, arValue: 2, apValue: 'c' }
    ])('GET /manual-ledger-check/calculate with invalid querystring values %p returns manual-ledger-check view', async ({ paymentRequestId, arValue, apValue }) => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const options = {
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=${paymentRequestId}&ar-value=${arValue}&ap-value=${apValue}`
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
      expect(response.statusCode).toBe(400)
    })

    test('GET /manual-ledger-check/calculate with valid query string returns/manual-ledger-check', async () => {
      calculateManualLedger.mockResolvedValue({
        valueInPounds: 1,
        valueinPoundsText: '1',
        manualLedgerChecks: []
      })

      getManualLedger.mockResolvedValue(paymentRequest)

      const paymentRequestId = 1
      const arValue = 1
      const apValue = 1

      const options = {
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=${paymentRequestId}&ar-value=${arValue}&ap-value=${apValue}`
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })

    test('GET /manual-ledger-check/calculate with valid query string returns 500 error when manualLedgerData is invalid ', async () => {
      calculateManualLedger.mockResolvedValue({})

      getManualLedger.mockResolvedValue(paymentRequest)

      const paymentRequestId = 1
      const arValue = 1
      const apValue = 1

      const options = {
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=${paymentRequestId}&ar-value=${arValue}&ap-value=${apValue}`
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })

    test('POST /manual-ledger-check with valid payload redirects to /quality-check if agree', async () => {
      const options = {
        method: 'POST',
        auth,
        url: manualLedgerCheckUrl,
        payload: {
          paymentRequestId: '1',
          agree: true
        }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('POST /manual-ledger-check with valid payload returns manual-ledger-check view if disagree', async () => {
      const options = {
        method: 'POST',
        auth,
        url: manualLedgerCheckUrl,
        payload: {
          paymentRequestId: '1',
          agree: false
        }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })
  })
})
