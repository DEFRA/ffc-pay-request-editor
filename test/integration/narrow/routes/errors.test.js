describe('errors test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/debt')
  const mockDebts = require('../../../../app/debt')

  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /unknown route returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/unknown'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(404)
  })

  test('GET /capture route throws an error within getDebts() and returns 500', async () => {
    const options = {
      method: 'GET',
      url: '/capture'
    }
    mockDebts.getDebts.mockImplementation(() => { throw new Error() })
    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
