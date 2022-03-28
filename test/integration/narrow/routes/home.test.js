const { ledger } = require('../../../../app/auth/permissions')

describe('Home test', () => {
  jest.mock('ffc-messaging')
  const createServer = require('../../../../app/server')
  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }
  let server

  beforeEach(async () => {
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
