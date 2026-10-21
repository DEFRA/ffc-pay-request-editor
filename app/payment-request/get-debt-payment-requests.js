const { debtData, paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { ENRICHMENT } = require('./categories')

const getDebtPaymentRequests = async () => {
  const debtDatas = await debtData()
    .select('paymentRequestId')
    .whereNotNull('debtType')
    .whereNotNull('recoveryDate')

  const debtDataIds = debtDatas.map(x => x?.paymentRequestId)

  return paymentRequest()
    .select(
      `${TABLES.paymentRequest}.paymentRequestId`,
      `${TABLES.paymentRequest}.invoiceNumber`,
      `${TABLES.paymentRequest}.frn`,
      `${TABLES.debtData}.debtType`,
      `${TABLES.debtData}.recoveryDate`
    )
    .leftJoin(TABLES.debtData, `${TABLES.debtData}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .whereNull(`${TABLES.paymentRequest}.released`)
    .whereIn(`${TABLES.paymentRequest}.paymentRequestId`, debtDataIds)
    .where(`${TABLES.paymentRequest}.categoryId`, ENRICHMENT)
}

module.exports = getDebtPaymentRequests
