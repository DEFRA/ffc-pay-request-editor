const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')
const config = require('../config')
const { getPaymentRequestByRequestId } = require('../payment-request')
const { EventPublisher } = require('ffc-pay-event-publisher')

const sendManualLedgerReviewEvent = async (paymentRequestId, user, status) => {
  if (config.useV1Events) {
    await sendV1ManualLedgerReviewEvent(paymentRequestId, user, status)
  }
  if (config.useV2Events) {
    await sendV2ManualLedgerReviewEvent(paymentRequestId, user, status)
  }
}

const sendV1ManualLedgerReviewEvent = async (paymentRequestId, user, status) => {
  const correlationId = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-ledger-assignment-quality-checked',
    type: 'info',
    message: 'Payment request ledger assignment quality checked',
    data: { status, user }
  }
  await raiseEvent(event)
}

const sendV2ManualLedgerReviewEvent = async (paymentRequestId, user, status) => {
  const paymentRequest = await getPaymentRequestByRequestId(paymentRequestId)
  const event = {
    source: 'ffc-pay-request-editor',
    type: `uk.gov.defra.ffc.pay.payment.ledger.quality-check.${status}`,
    data: {
      qualityCheckedBy: user,
      status,
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendManualLedgerReviewEvent
