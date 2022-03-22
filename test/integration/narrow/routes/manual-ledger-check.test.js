describe('Manual-ledger-check tests', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/manual-ledger')
  const { getManualLedgers } = require('../../../../app/manual-ledger')
  const createServer = require('../../../../app/server')

  let server
  const url = '/manual-ledger-check'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    getManualLedgers.mockResolvedValue([{
      paymentRequest: {
        frn: '1234567890'
      }
    }
    ])
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /manual-ledger-check with no paymentRequestId returns 404 view', async () => {
      const options = {
        method,
        url
      }
      const response = await server.inject(options)
      expect(response.request.response.source.template).toBe('404')
    })
  })

//   describe('POST requests', () => {
//     const method = 'POST'
//   })
})
