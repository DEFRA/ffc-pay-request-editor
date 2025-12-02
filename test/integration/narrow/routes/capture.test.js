const { enrichment } = require('../../../../app/auth/permissions')
const { getDebts } = require('../../../../app/debt')
const { mapExtract } = require('../../../../app/extract')
const convertToCSV = require('../../../../app/convert-to-csv')
const mockAuth = require('../../../../app/auth')
const createServer = require('../../../../app/server')
const { ADMINISTRATIVE, IRREGULAR } = require('../../../../app/constants/debt-types')

jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/debt')
jest.mock('../../../../app/extract')
jest.mock('../../../../app/convert-to-csv')
jest.mock('../../../../app/auth')

describe('Capture route tests', () => {
  let server
  const url = '/capture'
  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }
  const user = { userId: '1', username: 'Developer' }
  const debts = [
    {
      schemes: { name: 'SFI Pilot' },
      frn: '1234567890',
      reference: 'SFIP1234567',
      netValue: 1000.0,
      debtType: IRREGULAR,
      recoveryDate: '19/01/2022',
      attachedDate: '',
      createdBy: 'John Watson'
    },
    {
      schemes: { name: 'SFI' },
      frn: '1234567891',
      reference: 'SFIP1234568',
      netValue: 570.0,
      debtType: ADMINISTRATIVE,
      recoveryDate: '18/01/2022',
      attachedDate: '18/01/2022',
      createdBy: 'Steve Dickinson'
    }
  ]

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

  describe('GET /capture', () => {
    test.each([
      { url: '/capture', name: 'without query parameters' },
      { url: '/capture?page=2&perPage=10', name: 'with query parameters' }
    ])('returns 200 $name', async ({ url }) => {
      const response = await server.inject({ method: 'GET', url, auth })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })
  })

  describe('POST /capture', () => {
    test('No records found returns 400', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        payload: { frn: '1234567893' },
        auth
      })
      expect(response.statusCode).toBe(400)
      expect(response.request.response.source.context.model.input.errorMessage.text)
        .toEqual('No records could be found for that FRN/scheme combination.')
    })

    test.each([
      { payload: { frn: '1234567890', scheme: 'SFI Pilot' }, statusCode: 200 },
      { payload: { scheme: 'SFI Pilot' }, statusCode: 200 },
      { payload: { scheme: 'Invalid Scheme' }, statusCode: 400, errorField: 'select', errorMessage: 'The scheme chosen must be a valid scheme supported by the Payment Hub.' },
      { payload: {}, statusCode: 200 }
    ])('Payload %p returns correct status', async ({ payload, statusCode, errorField, errorMessage }) => {
      const response = await server.inject({ method: 'POST', url, payload, auth })
      expect(response.statusCode).toBe(statusCode)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
      if (errorField) {
        expect(response.request.response.source.context.model[errorField].errorMessage.text).toBe(errorMessage)
      }
    })

    test.each([
      { frn: 1234567890, statusCode: 200 },
      { frn: '1234567890', statusCode: 200 },
      { frn: '1234567899', statusCode: 400 },
      { frn: 'A123456789', statusCode: 400 },
      { frn: '12345', statusCode: 400 }
    ])('FRN %p returns correct status code', async ({ frn, statusCode }) => {
      const response = await server.inject({ method: 'POST', url, payload: { frn }, auth })
      expect(response.statusCode).toBe(statusCode)
    })

    test.each([
      { debtDataId: 1, statusCode: 302 },
      { debtDataId: '1', statusCode: 302 },
      { debtDataId: 'X', statusCode: 400 },
      { debtDataId: undefined, statusCode: 400 },
      { debtDataId: null, statusCode: 400 }
    ])('POST /capture/delete with %p returns correct status', async ({ debtDataId, statusCode }) => {
      const response = await server.inject({
        method: 'POST',
        url: '/capture/delete',
        payload: { debtDataId },
        auth
      })
      expect(response.statusCode).toBe(statusCode)
    })
  })

  describe('GET /capture/extract', () => {
    test('Returns 200 and calls required functions', async () => {
      const options = { method: 'GET', url: '/capture/extract', auth }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      await server.inject(options)
      expect(getDebts).toBeCalled()
      expect(mapExtract).toBeCalled()
      expect(convertToCSV).toBeCalled()
    })

    test.each([
      { mockFn: getDebts, returnValue: undefined },
      { mockFn: mapExtract, returnValue: undefined },
      { mockFn: convertToCSV, returnValue: undefined }
    ])('Returns unavailable page if %p returns null/undefined', async ({ mockFn, returnValue }) => {
      mockFn.mockReturnValue(returnValue)
      const response = await server.inject({ method: 'GET', url: '/capture/extract', auth })
      expect(response.payload).toContain('Debts report unavailable')
    })
  })
})
