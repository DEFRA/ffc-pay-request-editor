const { checkDebtsByEnrichment } = require('../debt')

const checkForDebtData = async (manualLedger) => {
  const { frn, agreementNumber, contractNumber, netValue } = manualLedger.ledgerPaymentRequest
  return checkDebtsByEnrichment(frn, agreementNumber, contractNumber, netValue)
}

module.exports = checkForDebtData
