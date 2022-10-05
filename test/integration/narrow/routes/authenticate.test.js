const { ledger } = require('../../../../app/auth/permissions')

describe('authenticate test', () => {
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  const createServer = require('../../../../app/server')
  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }
  const user = {
    homeAccountId: '1',
    username: 'Developer'
  }
  let server

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    server = await createServer()
    await server.initialize()
  })

  test('GET /authenticate route returns 302', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate',
      auth
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
  })

  test('GET /authenticate route redirects to /', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate',
      auth
    }

    const response = await server.inject(options)
    expect(response.headers.location).toBe('/')
  })

  test('GET /authenticate route calls authenticate', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate',
      auth
    }

    await server.inject(options)
    expect(mockAuth.authenticate).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
