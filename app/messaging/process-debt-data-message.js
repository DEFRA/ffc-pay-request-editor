const { processPaymentRequest } = require('../payment-request')
const util = require('util')

const processDebtDataMessage = async (message, receiver) => {
  try {
    const paymentRequest = message.body
    console.log('Payment request received for enrichment', util.inspect(paymentRequest, false, null, true))
    await processPaymentRequest(paymentRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process debt data message:', err)
  }
}

module.exports = processDebtDataMessage
