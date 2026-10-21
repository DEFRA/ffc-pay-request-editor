const { paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')

const getPaymentRequestCount = async (categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
  const { count } = await paymentRequest()
    .leftJoin(TABLES.debtData, `${TABLES.debtData}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .whereNull(`${TABLES.debtData}.debtDataId`)
    .whereIn(`${TABLES.paymentRequest}.categoryId`, [categoryId].flat())
    .count({ count: '*' })
    .first()
  return Number(count)
}

module.exports = getPaymentRequestCount
