describe('capture-debt route', () => {
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/processing/get-schemes')
  const getSchemes = require('../../../../app/processing/get-schemes')

  const SCHEMES = require('../../../data/scheme')

  let createServer
  let server

  const VALID_PAYLOAD = {
    scheme: 'SFI',
    frn: '1234567890',
    applicationIdentifier: '9876543210',
    net: 312.2,
    debtType: 'admin',
    'debt-discovered-day': 2,
    'debt-discovered-month': 1,
    'debt-discovered-year': 2022
  }

  beforeEach(async () => {
    getSchemes.mockResolvedValue(SCHEMES)

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

  test('POST /capture-debt with no FRN returns "The FRN is invalid" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The FRN is invalid')
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

  test('POST /capture-debt with no application identifier returns "The application identifier is invalid" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier is invalid')
  })

  test('POST /capture-debt with a nine digit application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a nine digit application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a nine digit application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a nine digit application identifier returns "The application identifier is too short" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier is too short')
  })

  test('POST /capture-debt with an eleven digit application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with an eleven digit application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with an eleven digit application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with an eleven digit application identifier returns "The application identifier is too long" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '12345678910' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier is too long')
  })

  test('POST /capture-debt with alphanumeric characters in the application identifier returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the application identifier returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the application identifier returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the application identifier returns "The application identifier must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '123456789A' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The application identifier must be a number')
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

  test('POST /capture-debt with no net returns "The net value must be between £0 and £1,000,000,000" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The net value must be between £0 and £1,000,000,000')
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

  test('POST /capture-debt with no debt day returns "The debt day must be between 1 and 31" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day must be between 1 and 31')
  })

  test('POST /capture-debt with a negative day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative day returns "The debt day cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot be less than 1')
  })

  test('POST /capture-debt with day 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with day 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with day 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with day 0 returns "The debt day cannot be less than 1" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot be less than 1')
  })

  test('POST /capture-debt with day 34 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with day 34 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with day 34 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with day 34 returns "The debt day cannot exceed 31" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day cannot exceed 31')
  })

  test('POST /capture-debt with alphanumeric characters in the day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the day returns "The debt day must be a number" error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' }
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorMessage.text).toEqual('The debt day must be a number')
  })
})
