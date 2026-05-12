const createMessage = require('./create-message')
const { updateQualityChecksStatus, getQualityCheckedPaymentRequests } = require('../quality-check')
const { updatePaymentRequestReleased } = require('../payment-request')
const { attachDebtToManualLedger } = require('../manual-ledger')

const publishQualityCheckedPaymentRequests = async (qualityCheckSender) => {
  try {
    const qualityCheckedPaymentRequests = await getQualityCheckedPaymentRequests()
    for (const qualityCheckedPaymentRequest of qualityCheckedPaymentRequests) {
      await attachDebtToManualLedger(qualityCheckedPaymentRequest, true)
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
  const message = createMessage(paymentRequest, 'uk.gov.defra.ffc.pay.quality.check')
  await qualityCheckSender.sendMessage(message)

  const sentRequest = message.body?.paymentRequest ?? message.body
  console.log('Completed request sent:', { sbi: sentRequest?.sbi, frn: sentRequest?.frn, invoiceNumber: sentRequest?.invoiceNumber })
}

module.exports = {
  publishQualityCheckedPaymentRequests,
  publishPaymentRequest
}
