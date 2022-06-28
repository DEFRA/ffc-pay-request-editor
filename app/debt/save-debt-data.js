const db = require('../data')

const saveDebtData = (updatedDebtData, transaction) => {
  const { paymentRequestId, debtDataId } = updatedDebtData
  const attachedDate = new Date()
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
