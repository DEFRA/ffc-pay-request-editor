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
      netValue: 570,
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

  describe('GET /capture records per page options', () => {
    const perPageOptions = [2500, 5000, 10000]

    test('renders all records per page options', async () => {
      const response = await server.inject({ method: 'GET', url, auth })
      for (const option of perPageOptions) {
        expect(response.payload).toContain(String(option))
      }
    })

    test('defaults to 2500 per page and highlights it as selected', async () => {
      const response = await server.inject({ method: 'GET', url, auth })
      expect(response.request.response.source.context.perPage).toBe(2500)
      expect(getDebts).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 2500, usePagination: true }))
      expect(response.payload).toContain('<strong>2500</strong>')
    })

    test.each(perPageOptions)('selecting %p per page requests that page size and highlights it', async (perPage) => {
      const response = await server.inject({ method: 'GET', url: `${url}?page=1&perPage=${perPage}`, auth })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.context.perPage).toBe(perPage)
      expect(getDebts).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: perPage, usePagination: true }))
      expect(response.payload).toContain(`<strong>${perPage}</strong>`)
      for (const option of perPageOptions.filter(x => x !== perPage)) {
        expect(response.payload).toContain(`/capture?perPage=${option}&page=1`)
        expect(response.payload).not.toContain(`<strong>${option}</strong>`)
      }
    })
  })

  describe('POST /capture', () => {
    test('No records found returns 200', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        payload: { frn: '1234567893' },
        auth
      })
      expect(response.statusCode).toBe(200)
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
      { frn: '1234567899', statusCode: 200 },
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
    test('No records found returns 200', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        payload: { frn: '1234567893' },
        auth
      })
      expect(response.statusCode).toBe(200)
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
  })

  describe('POST /capture-delete-confirm', () => {
    test('renders the delete confirmation page', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/capture-delete-confirm',
        payload: {
          debtdataid: '123',
          frn: '1234567890',
          scheme: 'SFI Pilot'
        },
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture-delete-confirm')
    })
  })
})
