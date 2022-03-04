const db = require('../data')

const saveDebtData = (updatedDebtData, transaction) => {
  const { paymentRequestId, attachedDate, debtDataId } = updatedDebtData
  return db.debtData.update({
    paymentRequestId,
    attachedDate
  },
  {
    where: {
      debtDataId
    }
  },
  {
    transaction
  }
  )
}

module.exports = saveDebtData
