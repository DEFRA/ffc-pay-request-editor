const checkDebts = require('./check-debts')
const getQualityCheck = require('./get-quality-check')
const saveDebtData =  require('./save-debt-data')
const db = require('../data')

const attachDebtInformation = async (paymentRequestId, paymentRequest, transaction) => {
  const frn = paymentRequest.frn
  const agreementNumber = paymentRequest.agreementNumber
  const value = paymentRequest.value  

  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)

  if (foundDebtData.length) {
    console.log('data found')
    // can we return just the first result instead of all to avoid this line?
    const updatedDebtData = foundDebtData[0].dataValues
    // set the new values
    updatedDebtData.paymentRequestId = paymentRequestId
    updatedDebtData.attachedDate = new Date()
    // save the data to db 
    await saveDebtData(updatedDebtData)
    console.log(updatedDebtData)

    // update the status in quality check table
    // does this need to be done after the other tables are saved?
    // const updatedQualityCheck = await getQualityCheck(paymentRequestId, transaction)
    // console.log(updatedQualityCheck)

  } else {
    console.log('no debt data found')
  }
}

module.exports = attachDebtInformation
