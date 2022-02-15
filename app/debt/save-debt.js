const db = require('../data')

const saveDebt = async (debtData) => {
  await db.debtData.create(debtData)
}

module.exports = saveDebt
