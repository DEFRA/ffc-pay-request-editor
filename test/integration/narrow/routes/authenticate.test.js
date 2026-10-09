describe('authenticate test', () => {
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /authenticate route returns 302', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
  })

  test('GET /authenticate route redirects to /', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate'
    }

    const response = await server.inject(options)
    expect(response.headers.location).toBe('/')
  })

  test('GET /authenticate route calls authenticate', async () => {
    const options = {
      method: 'GET',
      url: '/authenticate'
    }

    await server.inject(options)
    expect(mockAuth.authenticate).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
