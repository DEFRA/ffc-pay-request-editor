const { debtData } = require('../../database')
const toDebtRow = require('../../debt/to-debt-row')

const saveDebtData = async (debt, transaction) => {
  await debtData(transaction ?? undefined).insert(toDebtRow(debt))
}

module.exports = { saveDebtData }
