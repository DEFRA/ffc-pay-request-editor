jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/auth')
jest.mock('../../../../app/manual-ledger')

const { ledger } = require('../../../../app/auth/permissions')
const mockAuth = require('../../../../app/auth')
const { getManualLedgers } = require('../../../../app/manual-ledger')
const createServer = require('../../../../app/server')

describe('Manual ledger test', () => {
  let server
  const url = '/manual-ledger'
  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }
  const user = { userId: '1', username: 'Developer' }

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    mockAuth.getUser.mockResolvedValue(user)
    getManualLedgers.mockResolvedValue([{ frn: '1234567890' }])
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })

  describe('GET /manual-ledger', () => {
    test('returns 200 and manual-ledger view', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url,
        payload: { frn: '1234567890' }
      })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })
  })

  describe('POST /manual-ledger', () => {
    test('returns 200 and manual-ledger view with valid frn', async () => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url,
        payload: { frn: '1234567890' }
      })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })
  })
})
