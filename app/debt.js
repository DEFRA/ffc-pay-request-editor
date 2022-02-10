const captureData = require('./routes/capture-data')
const db = require('./data')

const getDebts = async () => {
  const debts = await db.debtData.findAll()
  console.log(debts)
  return captureData
}

module.exports = {
  getDebts
}
