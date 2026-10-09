const { qualityCheck } = require('../database')
const TABLES = require('../constants/tables')
const getManualLedgerRequestCheck = require('../manual-ledger/get-manual-ledger-requests')
const getPaymentRequestsWithLines = require('../payment-request/get-payment-requests-with-lines')
const { PASSED } = require('./statuses')

const getQualityCheckedPaymentRequests = async () => {
  const qualityChecks = await qualityCheck()
    .select(`${TABLES.qualityCheck}.paymentRequestId`)
    .innerJoin(TABLES.paymentRequest, `${TABLES.paymentRequest}.paymentRequestId`, `${TABLES.qualityCheck}.paymentRequestId`)
    .where(`${TABLES.qualityCheck}.status`, PASSED)
    .where(`${TABLES.paymentRequest}.categoryId`, 2)
    .orderBy(`${TABLES.qualityCheck}.qualityCheckId`, 'asc')

  const paymentRequests = await getPaymentRequestsWithLines(qualityChecks.map(x => x.paymentRequestId))

  const qualityCheckedPaymentRequests = []
  for (const { paymentRequestId } of qualityChecks) {
    const paymentRequest = paymentRequests.find(x => x.paymentRequestId === paymentRequestId)
    const manualLedgerRequests = await getManualLedgerRequestCheck(paymentRequestId)
    qualityCheckedPaymentRequests.push({
      paymentRequest,
      paymentRequests: manualLedgerRequests.map(x => x.ledgerPaymentRequest)
    })
  }

  return qualityCheckedPaymentRequests
}

module.exports = getQualityCheckedPaymentRequests
