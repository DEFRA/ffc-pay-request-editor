const getDebts = require('./get-debts')
const getDebtsCount = require('./get-debts-count')
const checkDebts = require('./check-debts')
const attachDebtInformation = require('./attach-debt-information')
const getQualityCheck = require('./get-quality-check')

module.exports = {
  getDebts,
  getDebtsCount,
  checkDebts,
  attachDebtInformation,
  getQualityCheck
}
