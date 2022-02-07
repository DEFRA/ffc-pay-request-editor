const processPaymentRequest = require('../process-payment-request')

const processDebtDataMessage = async (message, receiver) => {
  try {
    console.log('Debt data message received')
    const paymentRequest = message.body
    await processPaymentRequest(paymentRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process debt data message:', err)
    await receiver.abandonMessage(message)
  }
}

module.exports = processDebtDataMessage
