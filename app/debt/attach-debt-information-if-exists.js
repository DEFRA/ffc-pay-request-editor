const config = require('../config')
const { sendEnrichRequestBlockedEvent } = require('../event')
const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')

const attachDebtInformationIfExists = async (paymentRequest, transaction) => {
  const { schemeId, frn, agreementNumber, value } = paymentRequest
  const foundDebtData = await checkDebts(schemeId, frn, agreementNumber, value, transaction)

  if (foundDebtData) {
    foundDebtData.paymentRequestId = paymentRequest.paymentRequestId
    const debtData = foundDebtData.dataValues ?? foundDebtData
    await saveDebtData(debtData, transaction)
    console.log('debt data updated')
  } else {
    console.log('no debt data found')
    if (config.isAlerting) {
      await sendEnrichRequestBlockedEvent({ ...paymentRequest })
    }
  }
}

module.exports = attachDebtInformationIfExists
