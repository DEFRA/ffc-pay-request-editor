const { debtData } = require('../database')

const removeDebtData = async (paymentRequestIds, transaction) => {
  await debtData(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestIds).del()
}

module.exports = {
  removeDebtData
}
