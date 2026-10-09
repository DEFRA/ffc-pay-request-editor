const { qualityCheck } = require('../database')

const removeQualityChecks = async (paymentRequestIds, transaction) => {
  await qualityCheck(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestIds).del()
}

module.exports = {
  removeQualityChecks
}
