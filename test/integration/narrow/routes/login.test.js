jest.mock('../../../../app/auth')
const mockAuth = require('../../../../app/auth')
const createServer = require('../../../../app/server')

describe('login test', () => {
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /login route returns 302', async () => {
    const options = {
      method: 'GET',
      url: '/login'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
  })

  test('GET /login route calls getAuthenticationUrl', async () => {
    const options = {
      method: 'GET',
      url: '/login'
    }

    await server.inject(options)
    expect(mockAuth.getAuthenticationUrl).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
