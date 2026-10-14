const config = require('../config')
const { sendEnrichRequestBlockedEvent } = require('../event')
const checkDebts = require('./check-debts')
const saveDebtData = require('./save-debt-data')

const attachDebtInformationIfExists = async (paymentRequest, transaction) => {
  const { schemeId, frn, agreementNumber, contractNumber, value } = paymentRequest
  const foundDebtData = await checkDebts(schemeId, frn, agreementNumber, contractNumber, value, transaction)

  if (foundDebtData) {
    foundDebtData.paymentRequestId = paymentRequest.paymentRequestId
    await saveDebtData(foundDebtData, transaction)
    console.log('debt data updated')
  } else {
    console.log('no debt data found')
    if (config.isAlerting) {
      await sendEnrichRequestBlockedEvent({ ...paymentRequest })
    }
  }
}

module.exports = attachDebtInformationIfExists
