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
    mockAuth.getUser.mockResolvedValue(user)

    getManualLedgers.mockResolvedValue({
      rows: [
        {
          frn: '1234567890'
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

  describe('GET /manual-ledger', () => {
    test('returns 200 and manual-ledger view', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('manual-ledger')
    })

    test('uses default pagination values', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url
      })

      expect(response.statusCode).toBe(200)

      expect(getManualLedgers).toHaveBeenCalledWith(
        expect.any(Array),
        1,
        100,
        true,
        undefined
      )
    })

    test('passes pagination parameters to getManualLedgers', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url: '/manual-ledger?page=2&perPage=10'
      })

      expect(response.statusCode).toBe(200)

      expect(getManualLedgers).toHaveBeenCalledWith(
        expect.any(Array),
        2,
        10,
        true,
        undefined
      )
    })

    test('passes frn filter to getManualLedgers', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url: '/manual-ledger?page=1&perPage=10&frn=1234567890'
      })

      expect(response.statusCode).toBe(200)

      expect(getManualLedgers).toHaveBeenCalledWith(
        expect.any(Array),
        1,
        10,
        true,
        '1234567890'
      )
    })
  })

  describe('POST /manual-ledger', () => {
    test('redirects for valid FRN', async () => {
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
        .toBe('/manual-ledger?page=1&perPage=100&frn=1234567890')
    })

    test('redirects for another valid FRN', async () => {
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
        .toBe('/manual-ledger?page=1&perPage=100&frn=1234567899')
    })

    test.each([
      { frn: 'A123456789' },
      { frn: '12345' }
    ])(
      'returns 400 for invalid FRN %p',
      async ({ frn }) => {
        const response = await server.inject({
          method: 'POST',
          auth,
          url,
          payload: { frn }
        })

        expect(response.statusCode).toBe(400)
        expect(response.request.response.variety).toBe('view')
        expect(response.request.response.source.template)
          .toBe('manual-ledger')
      }
    )
  })
})
