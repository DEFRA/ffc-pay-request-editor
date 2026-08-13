const { enrichment } = require('../../../../app/auth/permissions')
const { getDebts, deleteDebt } = require('../../../../app/debt')
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
  const auth = {
    strategy: 'session-auth',
    credentials: {
      scope: [enrichment]
    }
  }

  const user = {
    userId: '1',
    username: 'Developer'
  }

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

  const getDebtsResult = {
    rows: debts,
    count: debts.length
  }

  beforeEach(async () => {
    getDebts.mockResolvedValue(getDebtsResult)
    deleteDebt.mockResolvedValue(undefined)
    mapExtract.mockReturnValue(debts)

    convertToCSV.mockImplementation(data => {
      return data ? 'scheme,frn\nSFI Pilot,1234567890' : undefined
    })

    mockAuth.getUser.mockResolvedValue(user)

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  describe('GET /capture', () => {
    test('returns 200 using the default pagination values', async () => {
      const response = await server.inject({
        method: 'GET',
        url,
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')

      expect(getDebts).toHaveBeenCalledWith({
        includeAttached: true,
        page: 1,
        pageSize: 2500,
        usePagination: true,
        frn: undefined,
        scheme: undefined
      })

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          captureData: debts,
          page: 1,
          perPage: 2500,
          totalPages: 1,
          frn: undefined,
          scheme: undefined
        })
      )
    })

    test('returns 200 using the supplied pagination values', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/capture?page=2&perPage=10',
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('capture')

      expect(getDebts).toHaveBeenCalledWith({
        includeAttached: true,
        page: 2,
        pageSize: 10,
        usePagination: true,
        frn: undefined,
        scheme: undefined
      })

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          captureData: debts,
          page: 2,
          perPage: 10,
          totalPages: 1
        })
      )
    })

    test('passes the FRN and scheme filters to getDebts', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/capture?page=1&perPage=10&frn=1234567890&scheme=SFI+Pilot',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(getDebts).toHaveBeenCalledWith({
        includeAttached: true,
        page: 1,
        pageSize: 10,
        usePagination: true,
        frn: '1234567890',
        scheme: 'SFI Pilot'
      })

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          frn: '1234567890',
          scheme: 'SFI Pilot'
        })
      )
    })

    test.each([
      {
        query: '?page=invalid&perPage=invalid',
        expectedPage: 1,
        expectedPerPage: 2500
      },
      {
        query: '?page=0&perPage=0',
        expectedPage: 1,
        expectedPerPage: 2500
      },
      {
        query: '?page=-1&perPage=-10',
        expectedPage: 1,
        expectedPerPage: 2500
      }
    ])(
      'uses default pagination values for invalid query parameters: $query',
      async ({ query, expectedPage, expectedPerPage }) => {
        const response = await server.inject({
          method: 'GET',
          url: `/capture${query}`,
          auth
        })

        expect(response.statusCode).toBe(200)

        expect(getDebts).toHaveBeenCalledWith({
          includeAttached: true,
          page: expectedPage,
          pageSize: expectedPerPage,
          usePagination: true,
          frn: undefined,
          scheme: undefined
        })
      }
    )

    test('passes the debt added notification value to the view', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/capture?debtAdded=true',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          debtAdded: 'true'
        })
      )
    })

    test('passes the debt deleted notification value to the view', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/capture?debtDeleted=true',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          debtDeleted: 'true'
        })
      )
    })
  })

  describe('POST /capture', () => {
    test.each([
      {
        payload: {
          frn: '1234567890',
          scheme: 'SFI Pilot'
        },
        expectedLocation:
          '/capture?page=1&perPage=2500&frn=1234567890&scheme=SFI+Pilot'
      },
      {
        payload: {
          frn: '1234567890'
        },
        expectedLocation:
          '/capture?page=1&perPage=2500&frn=1234567890'
      },
      {
        payload: {
          scheme: 'SFI Pilot'
        },
        expectedLocation:
          '/capture?page=1&perPage=2500&scheme=SFI+Pilot'
      },
      {
        payload: {},
        expectedLocation:
          '/capture?page=1&perPage=2500'
      }
    ])(
      'redirects valid payload $payload to the filtered GET route',
      async ({ payload, expectedLocation }) => {
        const response = await server.inject({
          method: 'POST',
          url,
          payload,
          auth
        })

        expect(response.statusCode).toBe(302)
        expect(response.headers.location).toBe(expectedLocation)
      }
    )

    test.each([
      {
        payload: {
          frn: 'A123456789'
        },
        errorField: 'model',
        errorMessage: 'FRN'
      },
      {
        payload: {
          frn: '12345'
        },
        errorField: 'model',
        errorMessage: 'FRN'
      },
      {
        payload: {
          scheme: 'Invalid Scheme'
        },
        errorField: 'select',
        errorMessage:
          'The scheme chosen must be a valid scheme supported by the Payment Hub.'
      }
    ])(
      'returns 400 and renders the capture view for invalid payload $payload',
      async ({ payload, errorField, errorMessage }) => {
        const response = await server.inject({
          method: 'POST',
          url,
          payload,
          auth
        })

        expect(response.statusCode).toBe(400)
        expect(response.request.response.variety).toBe('view')
        expect(response.request.response.source.template).toBe('capture')

        expect(getDebts).toHaveBeenCalledWith({
          includeAttached: true,
          page: 1,
          pageSize: 2500,
          usePagination: true,
          frn: undefined,
          scheme: undefined
        })

        if (errorField === 'select') {
          expect(
            response.request.response.source.context.model.select
              .errorMessage.text
          ).toBe(errorMessage)
        } else {
          expect(response.payload).toContain(errorMessage)
        }
      }
    )
    test('returns an empty general message when validation errors have no messages', async () => {
      const response = await server.inject({
        method: 'POST',
        url,
        payload: {},
        auth
      })

      expect(response.statusCode).toBe(302)
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
      expect(response.request.response.source.template)
        .toBe('capture-delete-confirm')

      expect(response.request.response.source.context).toEqual(
        expect.objectContaining({
          debtdataid: '123',
          frn: '1234567890',
          scheme: 'SFI Pilot'
        })
      )
    })
  })

  describe('POST /capture/delete', () => {
    test.each([
      { debtDataId: 1 },
      { debtDataId: '1' }
    ])(
      'deletes the debt and redirects when debtDataId is $debtDataId',
      async ({ debtDataId }) => {
        const response = await server.inject({
          method: 'POST',
          url: '/capture/delete',
          payload: {
            debtDataId
          },
          auth
        })

        expect(response.statusCode).toBe(302)
        expect(response.headers.location).toBe(
          '/capture?debtDeleted=true'
        )
        expect(deleteDebt).toHaveBeenCalledWith(Number(debtDataId))
      }
    )

    test.each([
      { debtDataId: 'X' },
      { debtDataId: undefined },
      { debtDataId: null }
    ])(
      'returns 400 when debtDataId is $debtDataId',
      async ({ debtDataId }) => {
        const response = await server.inject({
          method: 'POST',
          url: '/capture/delete',
          payload: {
            debtDataId
          },
          auth
        })

        expect(response.statusCode).toBe(400)
        expect(response.request.response.variety).toBe('view')
        expect(response.request.response.source.template).toBe('capture')
        expect(deleteDebt).not.toHaveBeenCalled()

        expect(getDebts).toHaveBeenCalledWith({
          includeAttached: true,
          page: 1,
          pageSize: 2500,
          usePagination: true,
          frn: undefined,
          scheme: undefined
        })
      }
    )
    test('returns validation error message when debtDataId is invalid', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/capture/delete',
        payload: {
          debtDataId: 'X'
        },
        auth
      })

      expect(response.statusCode).toBe(400)
      expect(response.payload).toContain('debtDataId')
    })

    test('returns validation message when debtDataId is not numeric', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/capture/delete',
        payload: {
          debtDataId: 'X'
        },
        auth
      })

      expect(response.statusCode).toBe(400)
      expect(response.payload).toContain('debtDataId')
    })
  })

  describe('GET /capture/extract', () => {
    test('returns the CSV report and calls the required functions', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/capture/extract',
        auth
      })

      expect(response.statusCode).toBe(200)

      expect(getDebts).toHaveBeenCalledWith({
        includeAttached: true,
        page: 1,
        pageSize: 2500,
        usePagination: false
      })

      expect(mapExtract).toHaveBeenCalledWith(debts)
      expect(convertToCSV).toHaveBeenCalledWith(debts)

      expect(response.payload).toBe(
        '\uFEFFscheme,frn\nSFI Pilot,1234567890'
      )

      expect(response.headers['content-type']).toContain(
        'text/csv; charset=utf-8'
      )

      expect(response.headers['cache-control']).toBe('no-cache')
      expect(response.headers.connection).toBe('keep-alive')
      expect(response.headers['content-disposition']).toContain(
        'attachment;filename='
      )
    })

    test('returns the unavailable page when getDebts has no rows', async () => {
      getDebts.mockResolvedValue({
        rows: undefined,
        count: 0
      })

      const response = await server.inject({
        method: 'GET',
        url: '/capture/extract',
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('debts-report-unavailable')

      expect(mapExtract).not.toHaveBeenCalled()
      expect(convertToCSV).not.toHaveBeenCalled()
    })

    test('returns the unavailable page when mapExtract returns undefined', async () => {
      mapExtract.mockReturnValue(undefined)

      const response = await server.inject({
        method: 'GET',
        url: '/capture/extract',
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('debts-report-unavailable')

      expect(mapExtract).toHaveBeenCalledWith(debts)
      expect(convertToCSV).toHaveBeenCalledWith(undefined)
    })

    test('returns the unavailable page when convertToCSV returns undefined', async () => {
      convertToCSV.mockReturnValue(undefined)

      const response = await server.inject({
        method: 'GET',
        url: '/capture/extract',
        auth
      })

      expect(response.statusCode).toBe(200)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template)
        .toBe('debts-report-unavailable')

      expect(mapExtract).toHaveBeenCalledWith(debts)
      expect(convertToCSV).toHaveBeenCalledWith(debts)
    })
  })
})
