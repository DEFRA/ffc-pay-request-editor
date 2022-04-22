const db = require('../data')

const getDebtData = async (paymentRequestId) => {
  return db.debtData.findOne({
    where: {
      paymentRequestId
    }
  })
}

module.exports = getDebtData
