const { debtData } = require('../database')

const deleteDebt = async (debtDataId) => {
  await debtData().where({ debtDataId }).whereNull('paymentRequestId').del()
}

module.exports = deleteDebt
