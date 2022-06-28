const getDebts = require('./get-debts')
const getDebtsCount = require('./get-debts-count')
const checkDebts = require('./check-debts')
const checkDebtsByEnrichment = require('./check-debts-by-enrichment')
const attachDebtInformationIfExists = require('./attach-debt-information-if-exists')
const saveDebtData = require('./save-debt-data')
const saveDebt = require('./save-debt')
const deleteDebt = require('./delete-debt')
const getDebtData = require('./get-debt-data')
module.exports = {
  getDebts,
  getDebtsCount,
  checkDebts,
  attachDebtInformationIfExists,
  saveDebtData,
  saveDebt,
  deleteDebt,
  getDebtData,
  checkDebtsByEnrichment
}
