const createMessage = require('./create-message')
const { updateQualityChecksStatus, getQualityCheckedPaymentRequests } = require('../quality-check')
const { updatePaymentRequestReleased } = require('../payment-request')
const { attachDebtToManualLedger } = require('../manual-ledger')
const { PROCESSED } = require('../quality-check/statuses')

const publishQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const qualityCheckedPaymentRequest of qualityCheckedPaymentRequests) {
      await processQualityCheckedPaymentRequest(qualityCheckedPaymentRequest, qualityCheckSender) // NOSONAR
    }
  } catch (err) {
    console.error('Unable to process payment request message:', err)
  }
}

const processQualityCheckedPaymentRequest = async (qualityCheckedPaymentRequest, qualityCheckSender) => {
  await attachDebtToManualLedger(qualityCheckedPaymentRequest, true)
  const paymentRequestId = qualityCheckedPaymentRequest.paymentRequest.paymentRequestId
  await publishPaymentRequest(qualityCheckedPaymentRequest, qualityCheckSender)
  await updatePaymentRequestReleased(paymentRequestId)
  await updateQualityChecksStatus(paymentRequestId, PROCESSED)
}

const publishPaymentRequest = async (paymentRequest, qualityCheckSender) => {
  const message = createMessage(paymentRequest, 'uk.gov.defra.ffc.pay.quality.check')
  await qualityCheckSender.sendMessage(message)

  console.log('Completed request sent:', { frn: message.body.paymentRequest.frn, invoiceNumber: message.body.paymentRequest.invoiceNumber })
}

module.exports = {
  publishQualityCheckedPaymentRequests,
  publishPaymentRequest
}
