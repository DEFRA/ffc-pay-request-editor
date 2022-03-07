const util = require('util')
const createMessage = require('./create-message')
const {
  getQualityCheckedPaymentRequests,
  updatePaymentRequestReleased
} = require('../payment-request')

const publishQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const paymentRequest of qualityCheckedPaymentRequests) {
      await publishPaymentRequest(paymentRequest, qualityCheckSender)
      await updatePaymentRequestReleased(paymentRequest.paymentRequestId)
    }
  } catch (err) {
    console.error('Unable to process payment request message:', err)
  }
}

const publishPaymentRequest = async (paymentRequest, qualityCheckSender) => {
  const message = createMessage(paymentRequest, 'uk.gov.pay.quality.check')
  await qualityCheckSender.sendMessage(message)

  console.log('Completed request sent:', util.inspect(message, false, null, true))
}

module.exports = {
  publishQualityCheckedPaymentRequests,
  publishPaymentRequest
}
