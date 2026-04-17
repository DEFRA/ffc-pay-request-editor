const db = require('../data')

const removeQualityChecks = async (paymentRequestIds, transaction) => {
  await db.qualityCheck.destroy({
    where: { paymentRequestId: paymentRequestIds },
    transaction
  })
}

module.exports = {
  removeQualityChecks
}
