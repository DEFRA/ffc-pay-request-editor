describe('Manual ledger test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  const { getManualLedgers } = require('../../../../app/manual-ledger')

  const createServer = require('../../../../app/server')

  let server
  const url = '/manual-ledger'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
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
        url,
        payload: { frn: '1234567890' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /manual-ledger with no records returns error message ', async () => {
      const options = {
        method,
        url,
        payload: { frn: '1234567891' }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger')
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No payments match the FRN provided.')
    })

    test('POST /manual-ledger route returns 200 code with valid frn', async () => {
      const options = {
        method,
        url,
        payload: { frn: '1234567890' }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })
  })
})