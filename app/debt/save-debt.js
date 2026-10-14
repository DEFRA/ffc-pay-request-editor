const { debtData } = require('../database')
const toDebtRow = require('./to-debt-row')

const saveDebt = async (debt) => {
  await debtData().insert(toDebtRow(debt))
}

module.exports = saveDebt
