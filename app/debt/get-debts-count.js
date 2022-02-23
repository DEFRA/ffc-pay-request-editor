const db = require('../data')

const getDebtsCount = async () => {
  return db.debtData.count({
    where: {
      paymentRequestId: null
    }
  })
}

module.exports = getDebtsCount
