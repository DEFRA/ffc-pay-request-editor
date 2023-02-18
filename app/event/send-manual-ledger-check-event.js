const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')
const config = require('../config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { getPaymentRequestByRequestId } = require('../payment-request/get-payment-request')

const sendManualLedgerCheckEvent = async (paymentRequestId, user, provisionalLedgerData) => {
  if (config.useV1Events) {
    await sendV1ManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
  }
  if (config.useV2Events) {
    await sendV2ManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
  }
}

const sendV1ManualLedgerCheckEvent = async (paymentRequestId, user, provisionalLedgerData) => {
  const correlationId = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-ledger-assignment-reviewed',
    type: 'info',
    message: 'Payment request ledger assignment reviewed',
    data: { provisionalLedgerData, user }
  }
  await raiseEvent(event)
}

const sendV2ManualLedgerCheckEvent = async (paymentRequestId, user, provisionalLedgerData) => {
  const paymentRequest = await getPaymentRequestByRequestId(paymentRequestId)
  const event = {
    source: 'ffc-pay-request-editor',
    type: 'uk.gov.defra.ffc.pay.payment.ledger.assigned',
    data: {
      assignedBy: user,
      ...provisionalLedgerData,
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendManualLedgerCheckEvent
