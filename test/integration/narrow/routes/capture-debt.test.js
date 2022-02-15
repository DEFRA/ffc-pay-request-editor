describe('capture-debt route', () => {
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/processing/get-schemes')
  jest.mock('../../../../app/processing/get-scheme-id')

  const getSchemes = require('../../../../app/processing/get-schemes')
  const getSchemeId = require('../../../../app/processing/get-scheme-id')

  const db = require('../../../../app/data')
  const { SCHEMES, SCHEME_NAME_SFI } = require('../../../data/scheme')
  const { SCHEME_ID_SFI } = require('../../../data/scheme-id')

  let createServer
  let server

  const VALID_PAYLOAD = {
    scheme: SCHEME_NAME_SFI,
    frn: '1234567890',
    applicationIdentifier: '987654321A',
    net: 312.2,
    debtType: 'admin',
    'debt-discovered-day': 2,
    'debt-discovered-month': 1,
    'debt-discovered-year': 2022
  }

  beforeEach(async () => {
    getSchemes.mockResolvedValue(SCHEMES)
    getSchemeId.mockResolvedValue(SCHEME_ID_SFI)

    createServer = require('../../../../app/server')
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await server.stop()
  })

  test('GET /capture-debt returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt'
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(200)
  })

  test('GET /capture-debt returns capture-debt view', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt'
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('GET /capture-debt returns all scheme names', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt'
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no scheme selected returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no scheme selected returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no scheme selected returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no scheme selected returns "The scheme cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The scheme cannot be empty')
  })

  test('POST /capture-debt with no FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no FRN returns "The FRN cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The FRN cannot be empty')
  })

  test('POST /capture-debt with a nine digit FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a nine digit FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a nine digit FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a nine digit FRN returns "The FRN is too short" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The FRN is too short')
  })

  test('POST /capture-debt with an eleven digit FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with an eleven digit FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with an eleven digit FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with an eleven digit FRN returns "The FRN is too long" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The FRN is too long')
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns "The FRN must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The FRN must be a number')
  })

  test('POST /capture-debt with no application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no application identifier returns "The application identifier cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier cannot be empty')
  })

  test('POST /capture-debt with a nine character application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a nine character application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a nine character application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a nine character application identifier returns "The application identifier is too short" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier is too short')
  })

  test('POST /capture-debt with an eleven character application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A5B' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with an eleven character application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A5B' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with an eleven character application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A5B' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with an eleven character application identifier returns "The application identifier is too long" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123R6789A5B' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier is too long')
  })

  test('POST /capture-debt with non alphanumeric characters in the application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with non alphanumeric characters in the application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with non alphanumeric characters in the application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with non alphanumeric characters in the application identifier returns "The application identifier can only have alphanumeric characters" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier can only have alphanumeric characters')
  })

  test('POST /capture-debt with no net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no net returns "The net value cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value cannot be empty')
  })

  test('POST /capture-debt with a negative net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative net returns "The net value must be greater than £0" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value must be greater than £0')
  })

  test('POST /capture-debt with net 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 0 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with net 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with net 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with net 0 returns "The net value must be greater than £0" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value must be greater than £0')
  })

  test('POST /capture-debt with net 1200000000 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with net 1200000000 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with net 1200000000 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with net 1200000000 returns "The net value must be less than £1,000,000,000" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value must be less than £1,000,000,000')
  })

  test('POST /capture-debt with commas in net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with commas in net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with commas in net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with commas in net returns "The net value must be a number without commas" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value must be a number without commas')
  })

  test('POST /capture-debt with no debt type selected returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt type selected returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt type selected returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt type selected returns "The type of debt cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The type of debt cannot be empty')
  })

  test('POST /capture-debt with no debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt day returns "The debt day cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot be empty')
  })

  test('POST /capture-debt with a negative debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt day returns "The debt day cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot be less than 1')
  })

  test('POST /capture-debt with debt day 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt day 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt day 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt day 0 returns "The debt day cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot be less than 1')
  })

  test('POST /capture-debt with debt day 34 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt day 34 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt day 34 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt day 34 returns "The debt day cannot exceed 31" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot exceed 31')
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns "The debt day must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day must be a number')
  })

  test('POST /capture-debt with no debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt month returns "The debt month cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt month cannot be empty')
  })

  test('POST /capture-debt with a negative debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt month returns "The debt month cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt month cannot be less than 1')
  })

  test('POST /capture-debt with debt month 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt month 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt month 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt month 0 returns "The debt month cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt month cannot be less than 1')
  })

  test('POST /capture-debt with debt month 15 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt month 15 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt month 15 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt month 15 returns "The debt month cannot exceed 12" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt month cannot exceed 12')
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns "The debt month must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt month must be a number')
  })

  test('POST /capture-debt with no debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt year returns "The debt year cannot be empty" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year cannot be empty')
  })

  test('POST /capture-debt with a negative debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt year returns "The debt year cannot be before 1900" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year cannot be before 1900')
  })

  test('POST /capture-debt with debt year 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 0 returns "The debt year cannot be before 1900" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year cannot be before 1900')
  })

  test('POST /capture-debt with debt year 1878 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 1878 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 1878 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 1878 returns "The debt year cannot be before 1900" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year cannot be before 1900')
  })

  test('POST /capture-debt with debt year 2108 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 2108 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 2108 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 2108 returns "The debt year cannot be after 2100" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year cannot be after 2100')
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns "The debt year must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt year must be a number')
  })

  test('POST /capture-debt with valid payload returns 302', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD
    }
    const result = await server.inject(options)
    expect(result.statusCode).toBe(302)
  })

  test('POST /capture-debt with valid payload redirects to home', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD
    }
    const result = await server.inject(options)
    expect(result.headers.location).toBe('/')
  })

  test('POST /capture-debt with valid payload is saved to debtData table', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD
    }
    await db.paymentRequest.create({ schemeId: 1, frn: VALID_PAYLOAD.frn })

    await server.inject(options)

    const debtData = await db.debtData.findOne({ where: { schemeId: 1, frn: VALID_PAYLOAD.frn } })

    expect(debtData.schemeId).toBe(1)
    expect(debtData.frn).toBe(VALID_PAYLOAD.frn)
  })
})
