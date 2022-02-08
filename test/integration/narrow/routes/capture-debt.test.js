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
      method: 'GET',
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
      method: 'GET',
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
      method: 'GET',
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
})
