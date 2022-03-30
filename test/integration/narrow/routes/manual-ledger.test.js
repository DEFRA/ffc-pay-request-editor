const { ledger } = require('../../../../app/auth/permissions')

describe('Manual ledger test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  jest.mock('../../../../app/manual-ledger')
  const { getManualLedgers } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  let server
  const url = '/manual-ledger'

  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }

  const user = {
    homeAccountId: '1',
    username: 'Developer'
  }

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
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'
    test('GET /manual-ledger route returns 200', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '1234567890' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /manual-ledger route returns manual-ledger view', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '1234567890' }

      }
      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /manual-ledger with no records returns error message ', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '1234567891' }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No payments match the FRN provided.')
    })

    test('POST /manual-ledger with no records returns error message ', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: 1111111111 }

      }
      const response = await server.inject(options)
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No payments match the FRN provided.')
    })

    test('POST /manual-ledger with empty frn returns error message ', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '' }
      }

      const response = await server.inject(options)
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('The FRN cannot be empty.')
    })

    test('POST /manual-ledger with invalid frn returns error message ', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: 'abc123' }
      }
      const response = await server.inject(options)
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('The FRN must be a 10 digit number.')
    })

    test('POST /manual-ledger route returns 200 code with valid frn', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '1234567890' }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('POST /manual-ledger route returns manual-ledger view', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '1234567890' }
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })

    test('POST /manual-ledger route returns 400 code with a nine digit frn', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '123456789' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })

    test('POST /manual-ledger route returns 400 code with an eleven digit frn', async () => {
      const options = {
        method,
        auth,
        url,
        payload: { frn: '12345678901' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })
  })
})
