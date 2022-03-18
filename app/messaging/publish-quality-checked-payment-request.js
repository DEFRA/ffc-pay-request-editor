const util = require('util')
const createMessage = require('./create-message')
const { updateQualityChecksStatus } = require('../quality-check')
const {
  getQualityCheckedPaymentRequests,
  updatePaymentRequestReleased
} = require('../payment-request')

const publishQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const qualityCheckedPaymentRequest of qualityCheckedPaymentRequests) {
      const paymentRequestId = qualityCheckedPaymentRequest.paymentRequest.paymentRequestId
      await publishPaymentRequest(qualityCheckedPaymentRequest, qualityCheckSender)
      await updatePaymentRequestReleased(paymentRequestId)
      await updateQualityChecksStatus(paymentRequestId, 'Processed')
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
