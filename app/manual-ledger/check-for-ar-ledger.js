const config = require('../config')

const { AR } = require('../processing/ledger/ledgers')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const { sendEnrichRequestBlockedEvent } = require('../event')

const checkForDebtData = require('./check-for-debt-data')
const attachDebtInformation = require('./attach-debt-information')

const checkForARLedger = async (manualLedgerRequest, status) => {
  const arLedger = manualLedgerRequest
    .find(x => x?.ledgerPaymentRequest?.ledger === AR && x.ledgerPaymentRequest.value !== 0)

  if (arLedger) {
    const debtData = await checkForDebtData(arLedger)
    if (!debtData) {
      console.log('no debt data found')
      status = AWAITING_ENRICHMENT
      if (config.isAlerting) {
        await sendEnrichRequestBlockedEvent(manualLedgerRequest[0])
      }
    }

    await attachDebtInformation(debtData, arLedger)
  }

  return status
}

module.exports = checkForARLedger
