const db = require('../data')

const removeQualityChecks = async (paymentRequestIds, transaction) => {
  await db.qualityCheck.destroy({
    where: {
      paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
    },
    transaction
  })
}

module.exports = {
  removeQualityChecks
}
