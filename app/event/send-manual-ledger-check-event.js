const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { getPaymentRequestByRequestId } = require('../payment-request/get-payment-request')
const { SOURCE } = require('../constants/source')
const { LEDGER_ASSIGNMENT_REVIEWED } = require('../constants/events')

const sendManualLedgerCheckEvent = async (paymentRequestId, user, provisionalLedgerData) => {
  const paymentRequest = await getPaymentRequestByRequestId(paymentRequestId)
  const event = {
    source: SOURCE,
    type: LEDGER_ASSIGNMENT_REVIEWED,
    data: {
      assignedBy: user,
      ...provisionalLedgerData,
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendManualLedgerCheckEvent
