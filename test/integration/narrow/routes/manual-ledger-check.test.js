const { ledger } = require('../../../../app/auth/permissions')

describe('Manual-ledger-check tests', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  const { getManualLedgers, getManualLedger, calculateManualLedger } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  let server
  let paymentRequest

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    mockAuth.getUser.mockResolvedValue(user)

    getManualLedgers.mockResolvedValue([{
      paymentRequest: {
        frn: '1234567890'
      }
    }
    ])

    calculateManualLedger.mockResolvedValue({
      someValue: 'aaaa',
      someOtherValue: 'bbbb'
    })

    paymentRequest = {
      paymentRequestId: 1,
      manualLedgerChecks: []
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
    await server.stop()
  })

  describe('GET /manual-ledger-check requests', () => {
    const method = 'GET'
    const manualLedgerCheckUrl = '/manual-ledger-check'

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

    test('GET /manual-ledger-check with no manua Ledger data returns 404 view', async () => {
      getManualLedger.mockResolvedValue(null)
      const options = {
        method,
        auth,
        url: manualLedgerCheckUrl
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
    })
  })
})
