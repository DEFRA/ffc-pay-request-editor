const publishQualityCheckedPaymentRequest = require('./publish-quality-checked-payment-request')
const {
  getQualityCheckedPaymentRequests,
  updatePaymentRequestReleased
} = require('../payment-request')

const processQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const paymentRequest of qualityCheckedPaymentRequests) {
      await publishQualityCheckedPaymentRequest(paymentRequest, qualityCheckSender)
      await updatePaymentRequestReleased(paymentRequest.paymentRequestId)
    }
  } catch (err) {
    console.error('Unable to process payment request message:', err)
  }
}

module.exports = processQualityCheckedPaymentRequests
