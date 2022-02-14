const db = require('../data')

const saveDebtData = async (debtData, transaction) => {
  await db.debtData.create(debtData).catch(e => { console.log(e) })
}

module.exports = saveDebtData
