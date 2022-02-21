const db = require('../data')

const getDebtsCount = async () => {
  return db.debtData.count()
}

module.exports = getDebtsCount
