const db = require('../data')

const removeDebtData = async (paymentRequestIds, transaction) => {
  await db.debtData.destroy({
    where: { paymentRequestId: paymentRequestIds },
    transaction
  })
}

module.exports = {
  removeDebtData
}
