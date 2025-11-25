jest.mock('ffc-messaging')
jest.mock('../../../../app/plugins/crumb')
jest.mock('../../../../app/auth')
jest.mock('../../../../app/manual-ledger')
jest.mock('ffc-pay-event-publisher')

const { ledger } = require('../../../../app/auth/permissions')
const { PENDING, FAILED, NOT_READY } = require('../../../../app/quality-check/statuses')

const mockSendEvent = jest.fn()
const mockPublishEvent = jest.fn()

const MockPublishEvent = jest.fn(() => ({ sendEvent: mockSendEvent }))
const MockEventPublisher = jest.fn(() => ({ publishEvent: mockPublishEvent }))

const mockAuth = require('../../../../app/auth')
const { getManualLedger } = require('../../../../app/manual-ledger')
const createServer = require('../../../../app/server')

jest.mock('ffc-pay-event-publisher', () => ({
  PublishEvent: MockPublishEvent,
  EventPublisher: MockEventPublisher
}))

describe('Manual-ledger-review tests', () => {
  let server
  const url = '/manual-ledger-review'
  const auth = { strategy: 'session-auth', credentials: { scope: [ledger] } }
  const user = { userId: '1', username: 'Developer' }

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    mockAuth.getUser.mockResolvedValue(user)
    getManualLedger.mockResolvedValue({
      ledgerPaymentRequest: [{ ledger: 'AR', value: -10000 }],
      manualLedgerChecks: [{ createdById: '1' }]
    })
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })

  describe('GET /manual-ledger-review', () => {
    test('returns 200 and manual-ledger-review view for valid paymentRequestId', async () => {
      const response = await server.inject({
        method: 'GET',
        auth,
        url: `${url}?paymentrequestid=1`
      })
      expect(response.statusCode).toBe(200)
      expect(response.request.response.source.template).toBe('manual-ledger-review')
    })

    test.each([
      { desc: 'paymentRequestId is a string', query: 'abcdef' },
      { desc: 'paymentRequestId is invalid', query: '0' },
      { desc: 'no paymentRequestId', query: undefined },
      { desc: 'no manualLedgerData', query: '1', mockValue: undefined }
    ])('redirects to /quality-check when $desc', async ({ query, mockValue }) => {
      getManualLedger.mockResolvedValue(mockValue)
      const response = await server.inject({
        method: 'GET',
        auth,
        url: query !== undefined ? `${url}?paymentrequestid=${query}` : url
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/quality-check')
    })
  })

  describe('POST /manual-ledger-review', () => {
    test.each([
      { desc: 'blank payload', payload: {} },
      { desc: 'fails validation', payload: { paymentRequestId: 1, status: 0 } }
    ])('returns 400 when $desc', async ({ payload }) => {
      const response = await server.inject({
        method: 'POST',
        auth,
        url: `${url}?paymentrequestid=1`,
        payload
      })
      expect(response.statusCode).toBe(400)
    })

    test.each([FAILED, PENDING, NOT_READY])(
      'redirects to /quality-check when status is %s',
      async (status) => {
        const response = await server.inject({
          method: 'POST',
          auth,
          url: `${url}?paymentrequestid=1`,
          payload: { paymentRequestId: '1', status }
        })
        expect(response.statusCode).toBe(301)
        expect(response.headers.location).toBe('/quality-check')
      }
    )
  })
})
