const db = require('../data')

const attachDebtToManualLedger = async (qualityCheckedPaymentRequest, addToAR = false) => {
  const paymentRequest = qualityCheckedPaymentRequest.paymentRequest
  const debtData = await db.debtData.findOne({
    where: {
      paymentRequestId: paymentRequest.paymentRequestId
    }
  })

  addDebtData(debtData, paymentRequest)

  if (addToAR) {
    attachDebtToAR(debtData, qualityCheckedPaymentRequest.paymentRequests)
  }

  return qualityCheckedPaymentRequest
}

const attachDebtToAR = (debtData, paymentRequests) => {
  const arLedger = paymentRequests.find(x => x.ledger === 'AR')
  arLedger.debtType = debtData.debtType
  arLedger.recoveryDate = debtData.recoveryDate
}

const addDebtData = (debtData, paymentRequest) => {
  if (debtData) {
    paymentRequest.debtType = debtData.debtType
    paymentRequest.recoveryDate = debtData.recoveryDate
    paymentRequest.attachedDate = debtData.attachedDate
  }
}

module.exports = attachDebtToManualLedger
