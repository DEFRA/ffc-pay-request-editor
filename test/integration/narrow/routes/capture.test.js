const { enrichment } = require('../../../../app/auth/permissions')

describe('Capture test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/debt')
  const { getDebts } = require('../../../../app/debt')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')

  const createServer = require('../../../../app/server')
  let server
  const url = '/capture'

  const { ADMINISTRATIVE, IRREGULAR } = require('../../../../app/constants/debt-types')

  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  const debts = [{
    scheme: 'SFI Pilot',
    frn: '1234567890',
    reference: 'SFIP1234567',
    netValue: 1000.00,
    debtType: IRREGULAR,
    recoveryDate: '19/01/2022',
    attachedDate: '',
    createdBy: 'John Watson'
  },
  {
    scheme: 'SFI',
    frn: '1234567891',
    reference: 'SFIP1234568',
    netValue: 570.00,
    debtType: ADMINISTRATIVE,
    recoveryDate: '18/01/2022',
    attachedDate: '18/01/2022',
    createdBy: 'Steve Dickinson'
  }]

  beforeEach(async () => {
    getDebts.mockResolvedValue(debts)
    mockAuth.getUser.mockResolvedValue(user)
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /capture route returns 200', async () => {
      const options = {
        method,
        url,
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /capture with no records returns "No debts match the FRN provided.', async () => {
      const options = {
        method,
        url,
        payload: { frn: '1234567893' },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
      expect(response.request.response.source.context.model.errorMessage.text).toEqual('No debts match the FRN provided.')
    })

    test.each([
      { frn: 1234567890, statusCode: 200 },
      { frn: '1234567890', statusCode: 200 },
      { frn: '1234567899', statusCode: 400 },
      { frn: 'A123456789', statusCode: 400 },
      { frn: '12345', statusCode: 400 }
    ])('POST /capture %p route returns the correct status code', async ({ frn, statusCode }) => {
      const options = {
        method,
        url,
        payload: { frn },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(statusCode)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })

    test.each([
      { debtDataId: 1, statusCode: 302 },
      { debtDataId: '1', statusCode: 302 },
      { debtDataId: 'X', statusCode: 400 },
      { debtDataId: undefined, statusCode: 400 },
      { debtDataId: null, statusCode: 400 }
    ])('POST /capture/delete %p route returns the correct status code', async ({ debtDataId, statusCode }) => {
      const options = {
        method,
        url: '/capture/delete',
        payload: { debtDataId },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(statusCode)
    })
  })
})
