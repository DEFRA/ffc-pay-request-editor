const getQualityChecks = require('./get-quality-checks')
const getQualityChecksCount = require('./get-quality-checks-count')
const updateQualityChecksStatus = require('./update-quality-checks-status')
const getQualityCheckedPaymentRequests = require('./get-quality-checked-payment-requests')

module.exports = {
  getQualityChecks,
  getQualityChecksCount,
  updateQualityChecksStatus,
  getQualityCheckedPaymentRequests
}
