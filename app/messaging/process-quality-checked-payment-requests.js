const publishQualityCheckRequest = require('./publish-quality-check-request')
const {
  getQualityCheckedPaymentRequests,
  updatePaymentRequestReleased
} = require('../payment-request')

const processQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const paymentRequest of qualityCheckedPaymentRequests) {
      await publishQualityCheckRequest(paymentRequest, qualityCheckSender)
      await updatePaymentRequestReleased(paymentRequest.paymentRequestId)
    }
  } catch (err) {
    console.error('Unable to process quality check message:', err)
  }
}

module.exports = processQualityCheckedPaymentRequests
