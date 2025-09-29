const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { getPaymentRequestByRequestId } = require('../payment-request/get-payment-request')
const { SOURCE } = require('../constants/source')
const { LEDGER_ASSIGNMENT_QUALITY_CHECK } = require('../constants/events')

const sendManualLedgerReviewEvent = async (paymentRequestId, user, status) => {
  const paymentRequest = await getPaymentRequestByRequestId(paymentRequestId)
  const event = {
    source: SOURCE,
    type: `${LEDGER_ASSIGNMENT_QUALITY_CHECK}${status.toLowerCase()}`,
    data: {
      qualityCheckedBy: user,
      status,
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendManualLedgerReviewEvent
