const { checkDebtsByEnrichment } = require('../debt')

const attachDebtToManualLedger = async (qualityCheckedPaymentRequest, addToAR = false) => {
  const paymentRequest = qualityCheckedPaymentRequest.paymentRequest

  const { frn, agreementNumber, netValue } = paymentRequest
  const debtData = await checkDebtsByEnrichment(frn, agreementNumber, netValue)

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
