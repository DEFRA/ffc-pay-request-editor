const getDebts = require('./get-debts')
const getDebtsCount = require('./get-debts-count')
const checkDebts = require('./check-debts')
const attachDebtInformation = require('./attach-debt-information')
const saveDebtData = require('./save-debt-data')
const saveDebt = require('./save-debt')
const deleteDebt = require('./delete-debt')
const getDebtData = require('./get-debt-data')
module.exports = {
  getDebts,
  getDebtsCount,
  checkDebts,
  attachDebtInformation,
  saveDebtData,
  saveDebt,
  deleteDebt,
  getDebtData
}
