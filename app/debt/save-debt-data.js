const db = require('../data')

const saveDebtData = async (updatedDebtData) => {
  const { paymentRequestId, attachedDate, debtDataId } = updatedDebtData 
  return db.debtData.update({ 
    paymentRequestId: paymentRequestId,
    attachedDate: attachedDate
  },
  {
    where: {
      debtDataId: debtDataId
    }
  })
}

module.exports = saveDebtData
