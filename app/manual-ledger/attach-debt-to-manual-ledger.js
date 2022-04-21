const db = require('../data')

const attachDebtToManualLedger = async (paymentRequest) => {
  const debtData = await db.debtData.findOne({
    where: {
      paymentRequestId: paymentRequest.paymentRequestId
    }
  })

  if (debtData) {
    paymentRequest.debtType = debtData.debtType
    paymentRequest.recoveryDate = debtData.recoveryDate
    paymentRequest.attachedDate = debtData.attachedDate
  }
  return paymentRequest
}

module.exports = attachDebtToManualLedger
