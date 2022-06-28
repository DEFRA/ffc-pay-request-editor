const { saveDebtData } = require('../debt')

const attachDebtInformation = async (debtData, arLedger) => {
  if (debtData) {
    checkIfCapture(debtData, arLedger)
    await saveDebtData(debtData)
  }
}

const checkIfCapture = (debtData, arLedger) => {
  if (!debtData.paymentRequestId) debtData.paymentRequestId = arLedger.paymentRequestId
}

module.exports = attachDebtInformation
