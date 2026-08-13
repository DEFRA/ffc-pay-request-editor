const { enrichment } = require('../../../../app/auth/permissions')

jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/payment-request')
jest.mock('../../../../app/auth')

const mockAuth = require('../../../../app/auth')
const { getPaymentRequest } = require('../../../../app/payment-request')

const createServer = require('../../../../app/server')

describe('Enrich test', () => {
  let server

  const url = '/enrich'

  const auth = {
    strategy: 'session-auth',
    credentials: {
      scope: [enrichment]
    }
  }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)

    getPaymentRequest.mockResolvedValue({
      rows: [
        {
          frn: '1234567890',
          netValue: '100.00',
          debtType: 'Debt',
          attachedDate: '2020-01-01',
          createdBy: 'test'
        }
      ],
      count: 1
    })

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  describe('GET requests', () => {
    test('GET /enrich route returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        url,
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('enrich')
    })

    test('GET /enrich with pagination parameters returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/enrich?page=2&perPage=10',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(getPaymentRequest).toHaveBeenCalledWith(
        2,
        10,
        true,
        undefined
      )
    })

    test('GET /enrich with FRN filter returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/enrich?page=1&perPage=10&frn=1234567890',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(getPaymentRequest).toHaveBeenCalledWith(
        1,
        10,
        true,
        '1234567890'
      )
    })

    test('GET /enrich uses default pagination values', async () => {
      const response = await server.inject({
        method: 'GET',
        url,
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(getPaymentRequest).toHaveBeenCalledWith(
        1,
        100,
        true,
        undefined
      )
    })
  })

  describe('POST requests', () => {
    test('POST /enrich redirects for valid numeric FRN', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        auth,
        payload: {
          frn: '1234567890'
        }
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location)
        .toBe('/enrich?page=1&perPage=100&frn=1234567890')
    })

    test('POST /enrich redirects for another valid FRN', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        auth,
        payload: {
          frn: '1234567893'
        }
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location)
        .toBe('/enrich?page=1&perPage=100&frn=1234567893')
    })

    test.each([
      { frn: 'A123456789' },
      { frn: '12345' }
    ])('POST /enrich with invalid FRN %p returns 400', async ({ frn }) => {
      const response = await server.inject({
        method: 'POST',
        url,
        auth,
        payload: { frn }
      })

      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('enrich')
    })
  })
})
