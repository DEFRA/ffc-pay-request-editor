const { ledger } = require('../../../../app/auth/permissions')

describe('Home test', () => {
  jest.mock('ffc-messaging')
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

  test('GET /route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/',
      auth
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
