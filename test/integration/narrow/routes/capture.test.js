const { enrichment } = require('../../../../app/auth/permissions')

describe('Capture test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/debt')
  const { getDebts } = require('../../../../app/debt')
  jest.mock('../../../../app/extract')
  const { mapExtract } = require('../../../../app/extract')
  jest.mock('../../../../app/convert-to-csv')
  const convertToCSV = require('../../../../app/convert-to-csv')
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
    schemes: {
      name: 'SFI Pilot'
    },
    frn: '1234567890',
    reference: 'SFIP1234567',
    netValue: 1000.00,
    debtType: IRREGULAR,
    recoveryDate: '19/01/2022',
    attachedDate: '',
    createdBy: 'John Watson'
  },
  {
    schemes: {
      name: 'SFI'
    },
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

    test('GET /capture with query parameters returns 200', async () => {
      const options = {
        method,
        url: `${url}?page=2&perPage=10`,
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

    test('POST /capture with no records returns "No debts match the FRN provided."', async () => {
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
      expect(response.request.response.source.context.model.input.errorMessage.text).toEqual('No records could be found for that FRN/scheme combination.')
    })

    test('POST /capture with both scheme and FRN provided returns 200', async () => {
      const options = {
        method,
        url,
        payload: { frn: '1234567890', scheme: 'SFI Pilot' },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })

    test('POST /capture with only scheme provided returns 200', async () => {
      const options = {
        method,
        url,
        payload: { scheme: 'SFI Pilot' },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
    })

    test('POST /capture with invalid scheme returns 400', async () => {
      const options = {
        method,
        url,
        payload: { scheme: 'Invalid Scheme' },
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
      expect(response.request.response.source.context.model.select.errorMessage.text).toEqual('The scheme chosen must be a valid scheme supported by the Payment Hub.')
    })

    test('POST /capture with missing scheme and FRN returns 200', async () => {
      const options = {
        method,
        url,
        payload: {},
        auth
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')
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

  test('GET /capture/extract route returns stream if report available', async () => {
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /capture/extract should call getdebts', async () => {
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    await server.inject(options)
    expect(getDebts).toBeCalled()
  })

  test('GET /capture/extract should call mapExtract', async () => {
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    await server.inject(options)
    expect(mapExtract).toBeCalled()
  })

  test('GET /capture/extract should call convertToCSV', async () => {
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    await server.inject(options)
    expect(convertToCSV).toBeCalled()
  })

  test('GET /capture/extract route returns unavailable page if getdebts returns undefined', async () => {
    getDebts.mockReturnValue(undefined)
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    const response = await server.inject(options)
    expect(response.payload).toContain('Debts report unavailable')
  })

  test('GET /capture/extract route returns unavailable page if mapextract returns null', async () => {
    mapExtract.mockReturnValue(undefined)
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    const response = await server.inject(options)
    expect(response.payload).toContain('Debts report unavailable')
  })

  test('GET /capture/extract route returns unavailable page if converttocsv returns null', async () => {
    convertToCSV.mockReturnValue(undefined)
    const options = {
      method: 'GET',
      url: '/capture/extract',
      auth
    }

    const response = await server.inject(options)
    expect(response.payload).toContain('Debts report unavailable')
  })
})
