jest.mock('ffc-messaging')
jest.mock('../../../app/payment-request')

const { MessageSender } = require('ffc-messaging')
const config = require('../../../app/config')
const db = require('../../../app/data')
const { getQualityCheckedPaymentRequests } = require('../../../app/payment-request')

const { SCHEME_ID_SFI_PILOT } = require('../../data/scheme-id')
const { SCHEME_NAME_SFI_PILOT } = require('../../data/scheme')

const publishQualityCheckedPaymentRequest = require('../../../app/messaging/publish-quality-checked-payment-request')

describe('Publish quality checked payment requests', () => {
  let qualityCheckSender
  let paymentRequest
  let message

  beforeEach(async () => {
    qualityCheckSender = new MessageSender(config.qcTopic)
    qualityCheckSender = { sendMessage: jest.fn() }

    const scheme = {
      schemeId: SCHEME_ID_SFI_PILOT,
      schemeName: SCHEME_NAME_SFI_PILOT
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: 2,
      frn: 1234567890,
      released: undefined
    }

    message = {
      body: paymentRequest,
      type: 'uk.gov.pay.quality.check',
      source: 'ffc-pay-request-editor'
    }

    await db.sequelize.truncate({ cascade: true })
    await db.scheme.create(scheme)

    getQualityCheckedPaymentRequests.mockResolvedValue(paymentRequest)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('completes valid message', async () => {
    await publishQualityCheckedPaymentRequest(paymentRequest, qualityCheckSender)
    expect(qualityCheckSender.sendMessage).toHaveBeenCalled()
    expect(qualityCheckSender.sendMessage).toHaveBeenCalledWith(message)
  })

  test('updates payment requests released', async () => {
    await publishQualityCheckedPaymentRequest(paymentRequest, qualityCheckSender)
    const updatedPaymentRequest = await db.paymentRequest.findOne({ where: { paymentRequestId: paymentRequest.paymentRequestId } })
    expect(updatedPaymentRequest.released).not.toBeNull()
  })
})
