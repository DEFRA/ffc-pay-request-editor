const db = require('../data')

const saveDebtData = async (debtData, transaction) => {
  await db.invoiceLine.create({ ...debtData }, { transaction })
}

module.exports = saveDebtData
