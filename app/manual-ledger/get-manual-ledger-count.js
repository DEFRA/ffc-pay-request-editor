const { paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { FAILED, NOT_READY } = require('../quality-check/statuses')
const { LEDGER_CHECK } = require('../payment-request/categories')

const getManualLedgerCount = async () => {
  const { count } = await paymentRequest()
    .innerJoin(TABLES.qualityCheck, `${TABLES.qualityCheck}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .where(`${TABLES.paymentRequest}.categoryId`, LEDGER_CHECK)
    .whereIn(`${TABLES.qualityCheck}.status`, [NOT_READY, FAILED])
    .count({ count: '*' })
    .first()
  return Number(count)
}

module.exports = getManualLedgerCount
