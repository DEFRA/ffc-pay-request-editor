const getDebts = require('./get-debts')
const getDebtsCount = require('./get-debts-count')
const checkDebts = require('./check-debts')
const attachDebtInformation = require('./attach-debt-information')
const saveDebtData = require('./save-debt-data')
const saveDebt = require('./save-debt')

module.exports = {
  getDebts,
  getDebtsCount,
  checkDebts,
  attachDebtInformation,
  saveDebtData,
  saveDebt
}
