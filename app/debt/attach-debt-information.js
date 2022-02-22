const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')

const attachDebtInformation = async (paymentRequestId, paymentRequest, transaction) => {
  const frn = paymentRequest.frn
  const agreementNumber = paymentRequest.agreementNumber
  const value = paymentRequest.value

  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)

  if (foundDebtData) {
    console.log('data found')
    foundDebtData.paymentRequestId = paymentRequestId
    foundDebtData.attachedDate = new Date()
    await saveDebtData(foundDebtData, transaction)
    console.log(foundDebtData)
  } else {
    console.log('no debt data found')
  }
}

module.exports = attachDebtInformation
