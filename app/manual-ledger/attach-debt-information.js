const { saveDebtData } = require('../debt')

const attachDebtInformation = async (debtData, arLedger) => {
  if (debtData) {
    checkIfCapture(debtData, arLedger)
    debtData.attachedDate = new Date().toISOString()
    await saveDebtData(debtData)
  }
}

const checkIfCapture = (debtData, arLedger) => {
  if (!debtData.paymentRequestId) debtData.paymentRequestId = arLedger.paymentRequestId
}

module.exports = attachDebtInformation
