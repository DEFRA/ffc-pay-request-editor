const util = require('util')
const createMessage = require('./create-message')
const {
  getEnrichedPaymentRequests,
  updatePaymentRequestReleased
} = require('../payment-request')
const { MessageSender } = require('ffc-messaging')
const config = require('../config')

const publishEnrichedPaymentRequests = async () => {
  const debtResponseSender = new MessageSender(config.debtResponseTopic)
  try {
    const paymentRequests = await getEnrichedPaymentRequests()
    for (const paymentRequest of paymentRequests) {
      const { paymentRequestId } = paymentRequest
      delete paymentRequest.paymentRequestId
      await publishPaymentRequest(paymentRequest, debtResponseSender)
      await updatePaymentRequestReleased(paymentRequestId)
    }
  } catch (err) {
    console.error('Unable to send enriched requests', err)
  } finally {
    await debtResponseSender.closeConnection()
  }
}

const publishPaymentRequest = async (paymentRequest, debtResponseSender) => {
  const message = createMessage(paymentRequest, 'uk.gov.pay.debt.data.response')
  await debtResponseSender.sendMessage(message)

  console.log('Completed request sent:', util.inspect(message, false, null, true))
}

module.exports = {
  publishEnrichedPaymentRequests,
  publishPaymentRequest
}
