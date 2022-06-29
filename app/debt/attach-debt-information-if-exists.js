const config = require('../config')
const { sendEnrichRequestBlockedEvent } = require('../event')
const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')

const attachDebtInformationIfExists = async (paymentRequestId, paymentRequest, transaction) => {
  const { frn, agreementNumber, value } = paymentRequest
  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)

  if (foundDebtData) {
    foundDebtData.paymentRequestId = paymentRequestId
    const debtData = foundDebtData.dataValues ?? foundDebtData
    await saveDebtData(debtData, transaction)
    console.log('debt data updated')
  } else {
    console.log('no debt data found')
    if (config.isAlerting) {
      await sendEnrichRequestBlockedEvent({ ...paymentRequest, paymentRequestId })
    }
  }
}

module.exports = attachDebtInformationIfExists
