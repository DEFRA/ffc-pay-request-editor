const { enrichment } = require('../../../../app/auth/permissions')

describe('capture-debt route', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/processing/scheme')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')

  const { getSchemeId, getSchemes } = require('../../../../app/processing/scheme')

  const db = require('../../../../app/data')
  const { SCHEMES, SCHEME_NAME_SFI } = require('../../../data/scheme')
  const { SCHEME_ID_SFI } = require('../../../data/scheme-id')
  const { ADMINISTRATIVE } = require('../../../../app/debt-types')

  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }

  const user = {
    userId: '1',
    username: 'Developer'
  }

  let createServer
  let server

  const VALID_PAYLOAD = {
    scheme: SCHEME_NAME_SFI,
    frn: '1234567890',
    applicationIdentifier: '43210987654321A',
    net: 312.2,
    debtType: ADMINISTRATIVE,
    'debt-discovered-day': 2,
    'debt-discovered-month': 1,
    'debt-discovered-year': 2021
  }

  beforeAll(async () => {
    await db.scheme.upsert({
      schemeId: 1,
      name: 'SFI'
    })
  })

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
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

  afterAll(async () => {
    await db.sequelize.close()
  })

  test('GET /capture-debt returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt',
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(200)
  })

  test('GET /capture-debt returns capture-debt view', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt',
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('GET /capture-debt returns all scheme names', async () => {
    const options = {
      method: 'GET',
      url: '/capture-debt',
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no scheme selected returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no scheme selected returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no scheme selected returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no scheme selected returns "The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums.')
  })

  test('POST /capture-debt with invalid scheme returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: 'not-a-scheme' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with invalid scheme returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: 'not-a-scheme' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with invalid scheme returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: 'not-a-scheme' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with invalid scheme returns "The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, scheme: 'not-a-scheme' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums.')
  })

  test('POST /capture-debt with no FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no FRN returns "The FRN must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The FRN must be a number.')
  })

  test('POST /capture-debt with a nine digit FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a nine digit FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a nine digit FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a nine digit FRN returns "The FRN must be 10 digits." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The FRN must be 10 digits.')
  })

  test('POST /capture-debt with an eleven digit FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with an eleven digit FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with an eleven digit FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with an eleven digit FRN returns "The FRN must be 10 digits." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '12345678910' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The FRN must be 10 digits.')
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the FRN returns "The FRN must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, frn: '123456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The FRN must be a number.')
  })

  test('POST /capture-debt with no agreement number returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no agreement number returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no agreement number returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no agreement number returns "The agreement number is invalid." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The agreement number is invalid.')
  })

  test('POST /capture-debt with non alphanumeric characters in the agreement number returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with non alphanumeric characters in the agreement number returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with non alphanumeric characters in the agreement number returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with non alphanumeric characters in the agreement number returns "The agreement number must be a string consisting of alphanumeric characters and underscores." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, applicationIdentifier: '!23456789A12345' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The agreement number must be a string consisting of alphanumeric characters and underscores.')
  })

  test('POST /capture-debt with no net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no net returns "The net value must be a number without commas." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The net value must be a number without commas.')
  })

  test('POST /capture-debt with a negative net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative net returns "The net value must be greater than £0" error message.', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -100.20 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The net value must be positive.')
  })

  test('POST /capture-debt with net negative returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -1 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with net negative returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -1 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with net negative returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -1 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with net negative returns "The net value must be positive." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: -1 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The net value must be positive.')
  })

  test('POST /capture-debt with net 1200000000 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with net 1200000000 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with net 1200000000 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with net 1200000000 returns "The net value must be less than £1,000,000,000." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: 1200000000 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The net value must be less than £1,000,000,000.')
  })

  test('POST /capture-debt with commas in net returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with commas in net returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with commas in net returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with commas in net returns "The net value must be a number without commas." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, net: '2,000.50' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The net value must be a number without commas.')
  })

  test('POST /capture-debt with no debt type selected returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt type selected returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt type selected returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt type selected returns "The type of debt must be either administrative or irregular." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The type of debt must be either administrative or irregular.')
  })

  test('POST /capture-debt with invalid debt type returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: 'not-a-debt-type' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with invalid debt type returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: 'not-a-debt-type' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with invalid debt type returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: 'not-a-debt-type' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with invalid debt type returns "The type of debt must be either administrative or irregular." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, debtType: 'not-a-debt-type' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The type of debt must be either administrative or irregular.')
  })

  test('POST /capture-debt with no debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt day returns "The debt day must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt day must be a number.')
  })

  test('POST /capture-debt with a negative debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt day returns "The debt day cannot be less than 1." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt day cannot be less than 1.')
  })

  test('POST /capture-debt with debt day 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt day 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt day 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt day 0 returns "The debt day cannot be less than 1." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt day cannot be less than 1.')
  })

  test('POST /capture-debt with debt day 34 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt day 34 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt day 34 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt day 34 returns "The debt day cannot be more than 31." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': 34 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt day cannot be more than 31.')
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt day returns "The debt day must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-day': '2nd' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt day must be a number.')
  })

  test('POST /capture-debt with no debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt month returns "The debt month must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt month must be a number.')
  })

  test('POST /capture-debt with a negative debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt month returns "The debt month cannot be less than 1." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt month cannot be less than 1.')
  })

  test('POST /capture-debt with debt month 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt month 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt month 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt month 0 returns "The debt month cannot be less than 1." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt month cannot be less than 1.')
  })

  test('POST /capture-debt with debt month 15 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt month 15 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt month 15 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt month 15 returns "The debt month cannot be more than 12." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 15 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt month cannot be more than 12.')
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt month returns "The debt month must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-month': 'March' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt month must be a number.')
  })

  test('POST /capture-debt with no debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with no debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with no debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with no debt year returns "The debt year must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year must be a number.')
  })

  test('POST /capture-debt with a negative debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with a negative debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with a negative debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with a negative debt year returns "The debt year cannot be before 2021." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': -4 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year cannot be before 2021.')
  })

  test('POST /capture-debt with debt year 0 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 0 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 0 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 0 returns "The debt year cannot be before 2021." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 0 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year cannot be before 2021.')
  })

  test('POST /capture-debt with debt year 1878 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 1878 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 1878 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 1878 returns "The debt year cannot be before 2021." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 1878 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year cannot be before 2021.')
  })

  test('POST /capture-debt with debt year 2108 returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with debt year 2108 returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with debt year 2108 returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with debt year 2108 returns "The debt year cannot be in the future." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': 2108 },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year cannot be in the future.')
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns capture-debt view', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('capture-debt')
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns all scheme names', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(scheme => scheme.name))
  })

  test('POST /capture-debt with alphanumeric characters in the debt year returns "The debt year must be a number." error message', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: { ...VALID_PAYLOAD, 'debt-discovered-year': '2020!' },
      auth
    }

    const result = await server.inject(options)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('The debt year must be a number.')
  })

  test('POST /capture-debt with valid payload returns 302', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD,
      auth
    }
    const result = await server.inject(options)
    expect(result.statusCode).toBe(302)
  })

  test('POST /capture-debt with valid payload redirects to home', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD,
      auth
    }
    const result = await server.inject(options)
    expect(result.headers.location).toBe('/')
  })

  test('POST /capture-debt with valid payload is saved to debtData table', async () => {
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: VALID_PAYLOAD,
      auth
    }
    await db.paymentRequest.create({ schemeId: 1, frn: VALID_PAYLOAD.frn })

    await server.inject(options)

    const debtData = await db.debtData.findOne({ where: { schemeId: 1, frn: VALID_PAYLOAD.frn } })

    expect(debtData.schemeId).toBe(1)
    expect(debtData.frn).toBe(VALID_PAYLOAD.frn)
  })

  test('POST /capture-debt returns 400 when the date payload is after the date that the debt was discovered', async () => {
    const debtDate = new Date()
    debtDate.setDate(debtDate.getDate() + 1)
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: {
        ...VALID_PAYLOAD,
        'debt-discovered-day': debtDate.getDate(),
        'debt-discovered-month': debtDate.getMonth() + 1,
        'debt-discovered-year': debtDate.getFullYear()
      },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('Date must not be in the future.')
  })

  test('POST /capture-debt returns 400 when the date payload is in the future', async () => {
    const currentDate = new Date('2022-01-01')
    Date.now = jest.fn().mockReturnValue(currentDate)
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: {
        ...VALID_PAYLOAD,
        'debt-discovered-day': 1,
        'debt-discovered-month': 2,
        'debt-discovered-year': 2022
      },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('Date must not be in the future.')
  })

  test('POST /capture-debt returns 400 when the date payload is an invalid leap year', async () => {
    const currentDate = new Date('2023-01-01')
    Date.now = jest.fn().mockReturnValue(currentDate)
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: {
        ...VALID_PAYLOAD,
        'debt-discovered-day': 29,
        'debt-discovered-month': 2,
        'debt-discovered-year': 2022
      },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('Date must be in the format YYYY-MM-DD.')
  })

  test('POST /capture-debt returns 400 when the date payload is an invalid date', async () => {
    const currentDate = new Date('2023-01-01')
    Date.now = jest.fn().mockReturnValue(currentDate)
    const options = {
      method: 'POST',
      url: '/capture-debt',
      payload: {
        ...VALID_PAYLOAD,
        'debt-discovered-day': 31,
        'debt-discovered-month': 9,
        'debt-discovered-year': 2022
      },
      auth
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
    expect(result.request.response.source.context.model.errorSummary[0].text).toEqual('Date must be in the format YYYY-MM-DD.')
  })
})
