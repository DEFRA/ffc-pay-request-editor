const { enrichment } = require('../../../../app/auth/permissions')
const db = require('../../../../app/data')

const { ADMINISTRATIVE } = require('../../../../app/debt-types')
const { PENDING, NOT_READY } = require('../../../../app/quality-check/statuses')

const resetData = async () => {
  await db.qualityCheck.truncate({ cascade: true })
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
  await db.paymentRequest.truncate({ cascade: true, restartIdentity: true })
}

describe('Enrich request test', () => {
  jest.mock('ffc-messaging')
  jest.mock('../../../../app/plugins/crumb')
  jest.mock('../../../../app/auth')
  const mockAuth = require('../../../../app/auth')
  const createServer = require('../../../../app/server')
  let server

  const user = {
    userId: '1',
    username: 'Developer'
  }

  const paymentRequest = {
    sourceSystem: 'SFIP',
    schemeId: 1,
    deliveryBody: 'RP00',
    invoiceNumber: 'S00000001SFIP000001V001',
    frn: 1234567890,
    sbi: 123456789,
    paymentRequestNumber: 1,
    agreementNumber: 'SIP00000000000001',
    contractNumber: 'SFIP000001',
    marketingYear: 2022,
    currency: 'GBP',
    schedule: 'M12',
    dueDate: '2021-08-15',
    value: 15000,
    invoiceLines: [
      {
        schemeCode: '80001',
        accountCode: 'SOS273',
        fundCode: 'DRD10',
        description: 'G00 - Gross value of claim',
        value: 25000
      },
      {
        schemeCode: '80001',
        accountCode: 'SOS273',
        fundCode: 'DRD10',
        description: 'P02 - Over declaration penalty',
        value: -10000
      }
    ]
  }

  const scheme = {
    schemeId: 1,
    name: 'SFI'
  }

  const qualityCheck = {
    qualityCheckId: 1,
    paymentRequestId: 1,
    checkedDate: null,
    checkedBy: null,
    status: NOT_READY
  }

  const auth = { strategy: 'session-auth', credentials: { scope: [enrichment] } }

  beforeEach(async () => {
    mockAuth.getUser.mockResolvedValue(user)
    await resetData()
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  describe('GET requests', () => {
    const method = 'GET'

    test('GET /enrich-request route returns 404 view when no query parameter provided', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request'
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('404')
    })

    test('GET /enrich-request route returns 404 view when invoiceNumber does not exist in the database', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request?invoiceNumber=S00000001SFIP000001V002'
      }

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('404')
    })

    test('GET /enrich-request route returns 404 view when request has been enriched already', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request?invoiceNumber=S00000001SFIP000001V001'
      }

      paymentRequest.released = new Date()

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('404')
    })

    test('GET /enrich-request route returns 200', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request?invoiceNumber=S00000001SFIP000001V001'
      }

      paymentRequest.released = undefined

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.source.template).toBe('enrich-request')
    })
  })

  describe('POST requests', () => {
    const method = 'POST'

    test('POST /enrich-request route redirects to /enrich when request has been enriched already', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request',
        payload: {
          day: 2,
          month: 2,
          year: 2022,
          'debt-type': ADMINISTRATIVE,
          'invoice-number': 'S00000001SFIP000001V001'
        }
      }

      paymentRequest.released = new Date()

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject(options)
      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/enrich')
    })

    test('POST /enrich-request route displays errors when input validation fails', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request',
        payload: {
          'invoice-number': 'S00000001SFIP000001V001'
        }
      }

      paymentRequest.released = undefined

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.statusCode).toBe(400)
      expect(response.request.response.source.template).toBe('enrich-request')
      expect(response.request.response.source.context.model.errorMessage.titleText).toBe('There is a problem')
      expect(response.request.response.source.context.model.errorMessage.errorList[0].message).toBe('"day" is required')
      expect(response.request.response.source.context.model.errorMessage.errorList[1].message).toBe('"month" is required')
      expect(response.request.response.source.context.model.errorMessage.errorList[2].message).toBe('"year" is required')
      expect(response.request.response.source.context.model.errorMessage.errorList[3].message).toBe('"debt-type" is required')
      expect(response.request.response.source.context.model.radio.errorMessage.text).toBe('Select the type of debt')
      expect(response.request.response.source.context.model.date.errorMessage.text).toBe('The date submitted is not valid')
    })

    test('POST /enrich-request route displays errors when date is in the future', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request',
        payload: {
          day: 2,
          month: 3,
          year: 4000,
          'debt-type': ADMINISTRATIVE,
          'invoice-number': 'S00000001SFIP000001V001'
        }
      }

      paymentRequest.released = undefined

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)

      const response = await server.inject(options)
      expect(response.request.response.variety).toBe('view')
      expect(response.request.response.statusCode).toBe(400)
      expect(response.request.response.source.template).toBe('enrich-request')
      expect(response.request.response.source.context.model.errorMessage.titleText).toBe('There is a problem')
      expect(response.request.response.source.context.model.date.errorMessage.text).toBe('Recovery date must be today or in the past')
    })

    test('POST /enrich-request route saves debt data when day and month are 1 digit then redirects to /enrich', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request',
        payload: {
          day: 2,
          month: 3,
          year: 2021,
          'debt-type': ADMINISTRATIVE,
          'invoice-number': 'S00000001SFIP000001V001'
        }
      }

      paymentRequest.released = undefined

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)
      await db.qualityCheck.create(qualityCheck)

      const response = await server.inject(options)
      const debtDataRow = await db.debtData.findAll({
        where: {
          debtDataId: 1
        }
      })

      const qualityChecksRow = await db.qualityCheck.findAll({
        where: {
          paymentRequestId: 1
        }
      })
      expect(qualityChecksRow[0].status).toBe(PENDING)

      expect(debtDataRow[0].paymentRequestId).toBe(1)
      expect(debtDataRow[0].schemeId).toBe(1)
      expect(parseInt(debtDataRow[0].frn)).toBe(1234567890)
      expect(debtDataRow[0].debtType).toBe(ADMINISTRATIVE)
      expect(debtDataRow[0].recoveryDate).toBe('02/03/2021')

      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/enrich')
    })

    test('POST /enrich-request route saves debt data when day and month are 2 digits then redirects to /enrich', async () => {
      const options = {
        method,
        auth,
        url: '/enrich-request',
        payload: {
          day: 12,
          month: 10,
          year: 2021,
          'debt-type': ADMINISTRATIVE,
          'invoice-number': 'S00000001SFIP000001V001'
        }
      }

      paymentRequest.released = undefined

      await db.scheme.create(scheme)
      await db.paymentRequest.create(paymentRequest)
      await db.qualityCheck.create(qualityCheck)

      const response = await server.inject(options)
      const debtDataRow = await db.debtData.findAll({
        where: {
          debtDataId: 1
        }
      })

      const qualityChecksRow = await db.qualityCheck.findAll({
        where: {
          paymentRequestId: 1
        }
      })
      expect(qualityChecksRow[0].status).toBe(PENDING)

      expect(debtDataRow[0].paymentRequestId).toBe(1)
      expect(debtDataRow[0].schemeId).toBe(1)
      expect(parseInt(debtDataRow[0].frn)).toBe(1234567890)
      expect(debtDataRow[0].debtType).toBe(ADMINISTRATIVE)
      expect(debtDataRow[0].recoveryDate).toBe('12/10/2021')

      expect(response.request.response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/enrich')
    })
  })
})
