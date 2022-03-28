describe('Manual-ledger-check tests', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  const { getManualLedger } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  let server
  let paymentRequest

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    paymentRequest = {
      paymentRequestId: 1,
      manualLedgerChecks: []
    }
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET /manual-ledger-check requests', () => {
    const method = 'GET'
    const manualLedgerCheckUrl = '/manual-ledger-check'

    test('GET /manual-ledger-check returns manual-ledger-check view', async () => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const options = {
        method,
        url: `${manualLedgerCheckUrl}?paymentrequestid=${paymentRequest.paymentRequestId}`
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
    })

    test('GET /manual-ledger-check with no manua Ledger data returns 404 view', async () => {
      getManualLedger.mockResolvedValue(null)
      const options = {
        method,
        url: manualLedgerCheckUrl
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
    })

    test('GET /manual-ledger-check with no paymentRequestId returns 404 view', async () => {
      const options = {
        method,
        url: manualLedgerCheckUrl
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
    })
  })

  describe('GET /manual-ledger-check/calculate  requests', () => {
    const method = 'GET'
    const manualLedgerCalculateUrl = '/manual-ledger-check/calculate'

    test('GET /manual-ledger-check/calculate with no paymentRequestId returns 404 view', async () => {
      const options = {
        method,
        url: manualLedgerCalculateUrl
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
      expect(response.statusCode).toBe(400)
    })

    test.each([
      { paymentRequestId: null, arValue: null, apValue: null, arPercentage: null, apPercentage: null },
      { paymentRequestId: 1, arValue: null, apValue: null, arPercentage: null, apPercentage: null },
      { paymentRequestId: 1, arValue: 2, apValue: null, arPercentage: null, apPercentage: null },
      { paymentRequestId: 1, arValue: 2, apValue: 3, arPercentage: null, apPercentage: null },
      { paymentRequestId: 1, arValue: 2, apValue: 3, arPercentage: 4, apPercentage: null },
      { paymentRequestId: 'a', arValue: 2, apValue: 3, arPercentage: 4, apPercentage: 5 },
      { paymentRequestId: 1, arValue: 'b', apValue: 3, arPercentage: 4, apPercentage: 5 },
      { paymentRequestId: 1, arValue: 2, apValue: 'c', arPercentage: 4, apPercentage: 5 },
      { paymentRequestId: 1, arValue: 2, apValue: 3, arPercentage: 'd', apPercentage: 5 },
      { paymentRequestId: 1, arValue: 2, apValue: 3, arPercentage: 4, apPercentage: 'e' }
    ])('GET /manual-ledger-check/calculate with invalid querystring values %p returns manual-ledger-check view', async ({ paymentRequestId, arValue, apValue, arPercentage, apPercentage }) => {
      getManualLedger.mockResolvedValue(paymentRequest)
      const options = {
        method,
        url: `${manualLedgerCalculateUrl}?paymentRequestId=${paymentRequestId}&ar-value=${arValue}&ap-value=${apValue}&ar-percentage=${arPercentage}&ap-percentage=${apPercentage}`
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('manual-ledger-check')
      expect(response.statusCode).toBe(400)
    })
  })

//   describe('POST requests', () => {
//     const method = 'POST'
//   })
})
