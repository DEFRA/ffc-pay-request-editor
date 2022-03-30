const { enrichment } = require('../../../../app/auth/permissions')

describe('Enrich test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/payment-request')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  const { getPaymentRequest } = require('../../../../app/payment-request')

  const createServer = require('../../../../app/server')

  let server
  const url = '/enrich'

  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }

  const user = {
    homeAccountId: '1',
    username: 'Developer'
  }

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    server = await createServer()
    await server.initialize()
    getPaymentRequest.mockResolvedValue([
      {
        frn: '1234567890',
        netValue: '100.00',
        debtType: 'Debt',
        attachedDate: '2020-01-01',
        createdBy: 'test'
      }
    ])
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /capture route returns 200', async () => {
      const options = {
        method,
        url,
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('enrich')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /enrich with no records returns "No debts match the FRN provided.', async () => {
      const options = {
        method: method,
        url,
        auth,
        payload: { frn: '1234567893' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('enrich')
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No payments match the FRN provided.')
    })

    test.each([
      { frn: 1234567890, statusCode: 200 },
      { frn: '1234567890', statusCode: 200 },
      { frn: '1234567899', statusCode: 400 },
      { frn: 'A123456789', statusCode: 400 },
      { frn: '12345', statusCode: 400 }
    ])('POST /enrich %p route returns the correct status code', async ({ frn, statusCode }) => {
      const options = {
        method,
        url,
        auth,
        payload: { frn }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(statusCode)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('enrich')
    })
  })
})
