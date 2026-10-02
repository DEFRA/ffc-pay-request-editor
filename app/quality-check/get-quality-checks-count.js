const { qualityCheck } = require('../database')
const TABLES = require('../constants/tables')
const { PENDING } = require('./statuses')

const getQualityChecksCount = async () => {
  const { count } = await qualityCheck()
    .innerJoin(TABLES.paymentRequest, `${TABLES.paymentRequest}.paymentRequestId`, `${TABLES.qualityCheck}.paymentRequestId`)
    .where(`${TABLES.paymentRequest}.categoryId`, 2)
    .where(`${TABLES.qualityCheck}.status`, PENDING)
    .count({ count: '*' })
    .first()
  return Number(count)
}

module.exports = getQualityChecksCount
