describe('Quality check test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/quality-check')
  const { getQualityChecks } = require('../../../../app/quality-check')

  const createServer = require('../../../../app/server')

  let server
  const url = '/quality-check'

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    getQualityChecks.mockResolvedValue([{ frn: '1234567890' }])
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /quality-check route returns 200', async () => {
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('quality-check')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /quality-check with no records returns "No debts match the FRN provided.', async () => {
      const options = {
        method: method,
        url: url,
        payload: { frn: '1234567893' }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('quality-check')
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No quality checks match the FRN provided.')
    })

    test.each([
      { frn: '1234567890', statusCode: 200 },
      { frn: '1123456789', statusCode: 400 },
      { frn: '12345', statusCode: 400 },
      { frn: 1234567890, statusCode: 400 }
    ])('POST /quality-check %p route returns the correct status code', async ({ frn, statusCode }) => {
      const options = {
        method,
        url,
        payload: { frn }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(statusCode)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('quality-check')
    })
  })
})
