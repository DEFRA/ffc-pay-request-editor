const { paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { FAILED, NOT_READY } = require('../quality-check/statuses')

const getManualLedgerCount = async () => {
  const { count } = await paymentRequest()
    .innerJoin(TABLES.qualityCheck, `${TABLES.qualityCheck}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .where(`${TABLES.paymentRequest}.categoryId`, 2)
    .whereIn(`${TABLES.qualityCheck}.status`, [NOT_READY, FAILED])
    .count({ count: '*' })
    .first()
  return Number(count)
}

module.exports = getManualLedgerCount
