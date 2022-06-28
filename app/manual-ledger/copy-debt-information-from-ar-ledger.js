const { saveDebtData } = require('../debt')

const copyDebtInformationFromArLedger = async (debtData, arLedger) => {
  if (debtData) {
    checkIfCapture(debtData, arLedger)
    await saveDebtData(debtData)
  }
}

const checkIfCapture = (debtData, arLedger) => {
  if (!debtData.paymentRequestId) debtData.paymentRequestId = arLedger.paymentRequestId
}

module.exports = copyDebtInformationFromArLedger
