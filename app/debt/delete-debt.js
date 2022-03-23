const db = require('../data')

const deleteDebt = async (debtDataId) => {
  await db.debtData.destroy({ where: { debtDataId, paymentRequestId: null } })
}

module.exports = deleteDebt
