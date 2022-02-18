describe('Review test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  const createServer = require('../../../../app/server')

  let server
  const url = '/quality-check-status-update'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /quality-check-status-update route returns 302 by redirecting to /quality-check', async () => {
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(302)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /quality-check-status-update with paymentrequestid and status redirect to quality-check after update with code 302', async () => {
      const options = {
        method: method,
        url: url,
        payload: { paymentrequestid: '1', status: 'False' }
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(302)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })

    test('POST /review with  only paymentrequestid redirect with code 301', async () => {
      const options = {
        method: method,
        url: url,
        payload: { paymentrequestid: '2' }
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(301)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })
  })
})
