const { processPaymentRequest } = require('../payment-request')

const processDebtDataMessage = async (message, receiver) => {
  try {
    const paymentRequest = message.body
    console.log('Payment request received for enrichment', { frn: paymentRequest.frn, sbi: paymentRequest.sbi, invoiceNumber: paymentRequest.invoiceNumber })
    await processPaymentRequest(paymentRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process debt data message:', err)
  }
}

module.exports = processDebtDataMessage
