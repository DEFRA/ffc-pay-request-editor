describe('Review test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/quality-check')
  jest.mock('../../../../app/payment-request')
  jest.mock('../../../../app/invoice-line')
  const { getPaymentRequest } = require('../../../../app/payment-request')
  const { getInvoiceLinesOfPaymentRequest } = require('../../../../app/invoice-line')

  const createServer = require('../../../../app/server')

  let server
  const url = '/review'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    getPaymentRequest.mockResolvedValue([{ paymentRequestId: 1 }])
    getInvoiceLinesOfPaymentRequest.mockResolvedValue([{ paymentRequestId: 1 }])
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /review route returns 200 if paymentrequestid in query-string and exist in database', async () => {
      const options = {
        method,
        url: '/review?paymentrequestid=1'
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('review')
      // expect(response.request.response.headers.location).toBe('/quality-check')
    })

    test('GET /review route redirects to /quality-check if paymentrequestid not in query-string', async () => {
      const options = {
        method,
        url: '/review'
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(302)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })

    test('GET /review route redirects to /quality-check if paymentrequestid in query-string but not in the database', async () => {
      const options = {
        method,
        url: '/review?paymentrequestid=6'
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(302)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /review with paymentrequestid  redirect to quality-check after update with code 302', async () => {
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

    test('POST /review with  no paymentrequestid redirect to quality-check with code 301', async () => {
      const options = {
        method: method,
        url: url,
        payload: { }
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('plain')
      expect(response.statusCode).toBe(301)
      expect(response.request.response.headers.location).toBe('/quality-check')
    })
  })
})
