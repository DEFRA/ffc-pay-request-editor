const { ledger } = require('../../../../app/auth/permissions')

jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/auth')
jest.mock('../../../../app/quality-check')

const mockAuth = require('../../../../app/auth')

const {
  getQualityChecks,
  getChangedQualityChecks
} = require('../../../../app/quality-check')

const createServer = require('../../../../app/server')

describe('Quality check test', () => {
  let server

  const url = '/quality-check'

  const auth = {
    strategy: 'session-auth',
    credentials: {
      scope: [ledger]
    }
  }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  beforeEach(async () => {
    getQualityChecks.mockResolvedValue({
      rows: [
        {
          paymentRequest: {
            frn: '1234567890'
          }
        }
      ],
      count: 1
    })

    getChangedQualityChecks.mockResolvedValue([
      {
        paymentRequest: {
          frn: '1234567890'
        }
      }
    ])

    mockAuth.getUser.mockReturnValue(user)

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  describe('GET requests', () => {
    test('GET /quality-check route returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('quality-check')
    })

    test('GET /quality-check with pagination parameters returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url: '/quality-check?page=2&perPage=10'
      })

      expect(response.statusCode).toBe(200)

      expect(getQualityChecks).toHaveBeenCalledWith(
        2,
        10,
        true,
        undefined
      )
    })

    test('GET /quality-check with FRN filter returns 200', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url: '/quality-check?page=1&perPage=10&frn=1234567890'
      })

      expect(response.statusCode).toBe(200)

      expect(getQualityChecks).toHaveBeenCalledWith(
        1,
        10,
        true,
        '1234567890'
      )
    })

    test('GET /quality-check uses default pagination values', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url
      })

      expect(response.statusCode).toBe(200)

      expect(getQualityChecks).toHaveBeenCalledWith(
        1,
        100,
        true,
        undefined
      )
    })
  })

  describe('POST requests', () => {
    test('POST /quality-check redirects for valid FRN', async () => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url,
        payload: {
          frn: '1234567890'
        }
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location)
        .toBe('/quality-check?page=1&perPage=100&frn=1234567890')
    })

    test('POST /quality-check redirects for another valid FRN', async () => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url,
        payload: {
          frn: '1234567899'
        }
      })

      expect(response.statusCode).toBe(302)
      expect(response.headers.location)
        .toBe('/quality-check?page=1&perPage=100&frn=1234567899')
    })

    test.each([
      { frn: 'A123456789' },
      { frn: '12345' }
    ])('POST /quality-check with invalid FRN %p returns 400', async ({ frn }) => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url,
        payload: { frn }
      })

      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('quality-check')
    })
  })
})
