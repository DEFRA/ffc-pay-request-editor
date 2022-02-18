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

    test('GET /review route returns 302 by redirecting to /quality-check', async () => {
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

    test('POST /review with  existing paymentrequestid displays review page', async () => {
      const options = {
        method: method,
        url: url,
        payload: { paymentrequestid: '1' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('review')
    })

    test('POST /review with  non-existing paymentrequestid displays error message', async () => {
      const options = {
        method: method,
        url: url,
        payload: { paymentrequestid: '2' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('review')
    })
  })
})
