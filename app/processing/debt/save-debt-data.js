const db = require('../../data')

const saveDebtData = async (debtData, transaction) => {
  await db.debtData.create(debtData, { transaction })
}

module.exports = { saveDebtData }
