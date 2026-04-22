const db = require('../data')

const removeDebtData = async (paymentRequestIds, transaction) => {
  await db.debtData.destroy({
    where: {
      paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
    },
    transaction
  })
}

module.exports = {
  removeDebtData
}
