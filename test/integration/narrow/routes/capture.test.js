describe('Capture test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  const createServer = require('../../../../app/server')
  let server
  const url = '/capture'

  jest.mock('../../../../app/debt')
  const { getDebts } = require('../../../../app/debt')

  const debts = [{
    scheme: 'SFI Pilot',
    frn: '1234567890',
    reference: 'SFIP1234567',
    netValue: 1000.00,
    debtType: 'Irregular',
    recoveryDate: '19/01/2022',
    attachedDate: '',
    createdBy: 'John Watson'
  },
  {
    scheme: 'SFI',
    frn: '1234567891',
    reference: 'SFIP1234568',
    netValue: 570.00,
    debtType: 'Administrative',
    recoveryDate: '18/01/2022',
    attachedDate: '18/01/2022',
    createdBy: 'Steve Dickinson'
  }]

  beforeEach(async () => {
    getDebts.mockResolvedValue(debts)
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.resetAllMocks()
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /capture route returns 200', async () => {
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test.each([
      { frn: '1234567890', statusCode: 200, callGetDebts: true },
      { frn: '1234567899', statusCode: 400, callGetDebts: true },
      { frn: 'A123456789', statusCode: 400, callGetDebts: false },
      { frn: '12345', statusCode: 400, callGetDebts: false },
      { frn: 1234567890, statusCode: 400, callGetDebts: false }
    ])('POST /capture %p route returns the correct status code', async ({ frn, statusCode, callGetDebts }) => {
      const options = {
        method,
        url,
        payload: { frn }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(statusCode)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })
  })
})
