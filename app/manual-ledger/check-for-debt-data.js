const { checkDebtsByEnrichment } = require('../debt')

const checkForDebtData = async (manualLedger) => {
  const { frn, agreementNumber, netValue } = manualLedger.ledgerPaymentRequest
  return checkDebtsByEnrichment(frn, agreementNumber, netValue)
}

module.exports = checkForDebtData
