jest.mock('../../../../app/auth')
const mockAuth = require('../../../../app/auth')
const createServer = require('../../../../app/server')

describe('logout test', () => {
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /logout route returns 302', async () => {
    const options = {
      method: 'GET',
      url: '/logout'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
  })

  afterEach(async () => {
    await server.stop()
  })
})
