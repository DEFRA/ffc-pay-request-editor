const db = require('../data')

const saveDebtData = (debtData, transaction) => {
  const { paymentRequestId, debtDataId } = debtData
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
