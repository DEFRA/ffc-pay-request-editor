describe('Manual-ledger-review tests', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  const { getManualLedger } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  let server
  const url = '/manual-ledger-review'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    getManualLedger.mockResolvedValue([
      {
        ledgerPaymentRequest: [{
          ledger: 'AR',
          value: -10000
        }]
      }
    ])
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests /manual-ledger-review', () => {
    const method = 'GET'
    test('GET /manual-ledger-review route returns 200 with a valid paymentRequestId', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /manual-ledger-review route returns manual-ledger-review view', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`
      }
      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('manual-ledger-review')
    })

    test('GET /manual-ledger-review if paymentRequestId is a string redirects to /quality-check', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=abcdef`
      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('GET /manual-ledger-review if paymentRequestId is invalid redirects to /quality-check', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=0`
      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('GET /manual-ledger-review if no paymentRequestId then redirect to /quality-check', async () => {
      const options = {
        method,
        url
      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('GET /manual-ledger-review if no manualLedgerData then redirect to /quality-check', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`
      }
      getManualLedger.mockResolvedValue()
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })
  })

  describe('POST requests /manual-ledger-review', () => {
    const method = 'POST'

    test('POST /manual-ledger-review returns 400 when payload is blank.', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`,
        payload: {}

      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(400)
    })

    test('POST /manual-ledger-review returns 400 when payload fails validation.', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`,
        payload: {
          paymentRequestId: 1,
          status: 0
        }

      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(400)
    })

    test('POST /manual-ledger-review with status of Failed redirects to /quality-check.', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`,
        payload: {
          paymentRequestId: '1',
          status: 'Failed'
        }

      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(301)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('POST /manual-ledger-review with status of Pending redirects to /quality-check.', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`,
        payload: {
          paymentRequestId: '1',
          status: 'Pending'
        }

      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(301)
      expect(response.headers.location).toBe('/quality-check')
    })

    test('POST /manual-ledger-review with status of Not ready redirects to /quality-check.', async () => {
      const options = {
        method,
        url: `${url}?paymentrequestid=1`,
        payload: {
          paymentRequestId: '1',
          status: 'Not ready'
        }

      }
      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(301)
      expect(response.headers.location).toBe('/quality-check')
    })
  })
})