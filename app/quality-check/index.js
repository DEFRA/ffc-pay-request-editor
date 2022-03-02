const getQualityChecks = require('./get-quality-checks')
const getQualityChecksCount = require('./get-quality-checks-count')
const updateQualityChecksStatus = require('./update-quality-checks-status')
const getSingleQualityCheck = require('./get-single-quality-check')
const getCompletedQualityCheckRequests = require('./get-completed-quality-check-requests')

module.exports = {
  getQualityChecks,
  getQualityChecksCount,
  updateQualityChecksStatus,
  getSingleQualityCheck,
  getCompletedQualityCheckRequests
}
