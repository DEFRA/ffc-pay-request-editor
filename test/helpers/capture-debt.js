const { enrichment } = require('../../app/auth/permissions')

describe('capture-debt route', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../app/plugins/crumb')
  jest.mock('../../app/processing/scheme')
  jest.mock('../../app/auth')
  const mockAuth = require('../../app/auth')
  const { getSchemeId, getSchemes } = require('../../app/processing/scheme')
  const db = require('../../app/data')
  const { SCHEMES } = require('../data/scheme')
  const { SCHEME_ID_SFI } = require('../data/scheme-id')
  const { ADMINISTRATIVE } = require('../../app/constants/debt-types')
  const {
    invalidSchemeTests,
    invalidFrnTests,
    invalidApplicationTests,
    invalidNetTests,
    invalidDebtTypeTests,
    invalidDateTests
  } = require('../helpers/capture-debt-validation-cases')

  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }
  const user = { userId: '1', username: 'Developer' }

  let createServer
  let server

  const VALID_PAYLOAD = {
    scheme: 'SFI22',
    frn: '1234567890',
    applicationIdentifier: '43210987654321A',
    net: 312.2,
    debtType: ADMINISTRATIVE,
    'debt-discovered-day': 2,
    'debt-discovered-month': 1,
    'debt-discovered-year': 2015
  }

  beforeAll(async () => {
    await db.scheme.upsert({ schemeId: 1, name: 'SFI' })
  })

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    getSchemes.mockResolvedValue(SCHEMES)
    getSchemeId.mockResolvedValue(SCHEME_ID_SFI)
    createServer = require('../../app/server')
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

  describe('GET /capture-debt', () => {
    test('returns 200 with capture-debt view and all scheme names', async () => {
      const result = await server.inject({ method: 'GET', url: '/capture-debt', auth })
      expect(result.statusCode).toBe(200)
      expect(result.request.response.variety).toBe('view')
      expect(result.request.response.source.template).toBe('capture-debt')
      expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(s => s.name))
    })
  })

  describe('POST /capture-debt - Valid submission', () => {
    test('redirects to home and saves to database', async () => {
      await db.paymentRequest.create({ schemeId: 1, frn: VALID_PAYLOAD.frn })
      const result = await server.inject({ method: 'POST', url: '/capture-debt', payload: VALID_PAYLOAD, auth })

      expect(result.statusCode).toBe(302)
      expect(result.headers.location).toBe('/')

      const debtData = await db.debtData.findOne({ where: { schemeId: 1, frn: VALID_PAYLOAD.frn } })
      expect(debtData.schemeId).toBe(1)
      expect(debtData.frn).toBe(VALID_PAYLOAD.frn)
    })
  })

  describe('POST /capture-debt - Validation errors', () => {
    const allTests = [
      ...invalidSchemeTests,
      ...invalidFrnTests,
      ...invalidApplicationTests,
      ...invalidNetTests,
      ...invalidDebtTypeTests,
      ...invalidDateTests
    ]

    allTests.forEach(({ description, field, error }) => {
      test(description, async () => {
        const payload = { ...VALID_PAYLOAD, ...field() }
        const result = await server.inject({
          method: 'POST',
          url: '/capture-debt',
          payload,
          auth
        })

        expect(result.statusCode).toBe(400)
        expect(result.request.response.variety).toBe('view')
        expect(result.request.response.source.template).toBe('capture-debt')
        expect(result.request.response.source.context.model.errorSummary[0].text).toEqual(error)
        expect(result.request.response.source.context.model.schemes).toStrictEqual(SCHEMES.map(s => s.name))
      })
    })
  })
})
