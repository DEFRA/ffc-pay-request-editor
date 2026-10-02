const { debtData } = require('../database')

const saveDebtData = (debt, transaction) => {
  const { paymentRequestId, debtDataId } = debt
  const attachedDate = new Date()
  return debtData(transaction ?? undefined)
    .where({ debtDataId })
    .update({
      paymentRequestId,
      attachedDate
    })
}

module.exports = saveDebtData
