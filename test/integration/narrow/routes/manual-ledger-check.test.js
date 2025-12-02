jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/manual-ledger')
jest.mock('../../../../app/event')
jest.mock('../../../../app/auth')
jest.mock('../../../../app/auth/get-user')
jest.mock('../../../../app/session-handler')

const { ledger } = require('../../../../app/auth/permissions')
const mockAuth = require('../../../../app/auth')
const mockGetUser = require('../../../../app/auth/get-user')
const mockSessionHandler = require('../../../../app/session-handler')
const { getManualLedgers, getManualLedger, calculateManualLedger } = require('../../../../app/manual-ledger')
const createServer = require('../../../../app/server')

describe('Manual-ledger-check tests', () => {
  let server
  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }
  const user = { userId: '1', username: 'Developer' }
  const method = 'GET'
  const manualLedgerCheckUrl = '/manual-ledger-check'
  const manualLedgerCalculateUrl = '/manual-ledger-check/calculate'

  let paymentRequest

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    mockAuth.getUser.mockResolvedValue(user)
    mockGetUser.mockResolvedValue(user)
    mockSessionHandler.get.mockReturnValue({ provisionalLedgerData: {} })

    getManualLedgers.mockResolvedValue([{ paymentRequest: { frn: '1234567890' } }])

    paymentRequest = { paymentRequestId: 1, manualLedgerChecks: [] }
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })

  describe('GET /manual-ledger-check', () => {
    test('returns manual-ledger-check view when paymentRequest exists', async () => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const response = await server.inject({
        method,
        auth,
        url: `${manualLedgerCheckUrl}?paymentrequestid=${paymentRequest.paymentRequestId}`
      })
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })

    test.each([
      { desc: 'no manual Ledger data', mockValue: null },
      { desc: 'no paymentRequestId', url: manualLedgerCheckUrl }
    ])('returns 404 view when $desc', async ({ mockValue, url }) => {
      if (mockValue !== undefined) {
        getManualLedger.mockResolvedValue(mockValue)
      }

      const response = await server.inject({ method, auth, url: url || `${manualLedgerCheckUrl}?paymentrequestid=${paymentRequest.paymentRequestId}` })
      expect(response.request.response.source.template).toBe('404')
    })
  })

  describe('GET /manual-ledger-check/calculate', () => {
    test('returns 404 when paymentRequestId not provided', async () => {
      const response = await server.inject({ method, auth, url: manualLedgerCalculateUrl })
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
    ])('returns manual-ledger-check view with 400 for invalid query %p', async ({ paymentRequestId, arValue, apValue }) => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const response = await server.inject({
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=${paymentRequestId}&ar-value=${arValue}&ap-value=${apValue}`
      })
      expect(response.request.response.source.template).toBe('manual-ledger-check')
      expect(response.statusCode).toBe(400)
    })

    test('returns manual-ledger-check view with 200 for valid query', async () => {
      getManualLedger.mockResolvedValue(paymentRequest)
      calculateManualLedger.mockResolvedValue({ valueInPounds: 1, valueinPoundsText: '1', manualLedgerChecks: [] })

      const response = await server.inject({
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=1&ar-value=1&ap-value=1`
      })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })

    test('returns 500 if manualLedgerData invalid', async () => {
      getManualLedger.mockResolvedValue(paymentRequest)
      calculateManualLedger.mockResolvedValue({})

      const response = await server.inject({
        method,
        auth,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=1&ar-value=1&ap-value=1`
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })
  })

  describe('POST /manual-ledger-check', () => {
    test('redirects to /quality-check if agree', async () => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url: manualLedgerCheckUrl,
        payload: { paymentRequestId: '1', agree: true }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('returns manual-ledger-check view if disagree', async () => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url: manualLedgerCheckUrl,
        payload: { paymentRequestId: '1', agree: false }
      })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })
  })
})
