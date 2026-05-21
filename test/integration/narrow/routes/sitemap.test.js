const createServer = require('../../../../app/server')
const mockAuth = require('../../../../app/auth')
const { enrichment } = require('../../../../app/auth/permissions')

jest.mock('../../../../app/auth')

describe('Sitemap route tests', () => {
  let server
  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }
  const user = { userId: '1', username: 'Developer' }

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  describe('GET /sitemap', () => {
    test.each([
      { url: '/sitemap' }
    ])('returns 200', async ({ url }) => {
      const response = await server.inject({ method: 'GET', url, auth })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('sitemap')
    })
  })
})
