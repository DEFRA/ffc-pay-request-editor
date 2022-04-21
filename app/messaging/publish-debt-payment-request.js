const util = require('util')
const createMessage = require('./create-message')
const { updateQualityChecksStatus } = require('../quality-check')
const { PASSED, PROCESSED } = require('../quality-check/statuses')
const { LEDGER_CHECK } = require('../payment-request/categories')
const { checkAwaitingManualLedgerDebtData } = require('../manual-ledger')
const {
  getDebtPaymentRequests,
  updatePaymentRequestReleased,
  updatePaymentRequestCategory
} = require('../payment-request')

const publishDebtPaymentRequests = async (debtSender) => {
  try {
    const debtPaymentRequests = await getDebtPaymentRequests()

    for (const paymentRequest of debtPaymentRequests) {
      const { paymentRequestId } = paymentRequest
      const inManualLedgerAwaitingDebtData = await checkAwaitingManualLedgerDebtData(paymentRequestId)

      if (inManualLedgerAwaitingDebtData) {
        await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
        await updateQualityChecksStatus(paymentRequestId, PASSED)
      } else {
        delete paymentRequest.paymentRequestId
        await publishPaymentRequest(paymentRequest, debtSender)
        await updatePaymentRequestReleased(paymentRequestId)
        await updateQualityChecksStatus(paymentRequestId, PROCESSED)
      }
    }
  } catch (err) {
    console.error('Unable to process payment request message:', err)
  }
}

const publishPaymentRequest = async (paymentRequest, debtSender) => {
  const message = createMessage(paymentRequest, 'uk.gov.pay.debt.check')
  await debtSender.sendMessage(message)

  console.log('Completed request sent:', util.inspect(message, false, null, true))
}

module.exports = {
  publishDebtPaymentRequests,
  publishPaymentRequest
}
