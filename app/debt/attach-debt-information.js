const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')
const updateQualityCheckStatus = require('../quality-check/update-quality-check-status')

const attachDebtInformation = async (paymentRequestId, paymentRequest, transaction) => {
  const frn = paymentRequest.frn
  const agreementNumber = paymentRequest.agreementNumber
  const value = paymentRequest.value

  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)

  if (foundDebtData) {
    foundDebtData.paymentRequestId = paymentRequestId
    foundDebtData.attachedDate = new Date()
    await saveDebtData(foundDebtData, transaction)
    await updateQualityCheckStatus(paymentRequestId, paymentRequest, transaction)
  } else {
    console.log('no debt data found')
  }
}

module.exports = attachDebtInformation
