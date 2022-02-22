const db = require('../data')

const saveDebtData = (updatedDebtData, transaction) => {
  const { paymentRequestId, attachedDate, debtDataId } = updatedDebtData
  return db.debtData.update({
    paymentRequestId: paymentRequestId,
    attachedDate: attachedDate
  },
  {
    where: {
      debtDataId: debtDataId
    }
  },
  {
    transaction
  }
  )
}

module.exports = saveDebtData
