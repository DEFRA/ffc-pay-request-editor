const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')

const attachDebtInformation = async (paymentRequestId, paymentRequest, transaction) => {
  const frn = paymentRequest.frn
  const agreementNumber = paymentRequest.agreementNumber
  const value = paymentRequest.value

  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)

  if (foundDebtData) {
    foundDebtData.paymentRequestId = paymentRequestId
    foundDebtData.attachedDate = new Date()
    const debtData = foundDebtData.dataValues ?? foundDebtData
    await saveDebtData(debtData, transaction)
    console.log('debt data updated')
  } else {
    console.log('no debt data found')
  }
}

module.exports = attachDebtInformation
