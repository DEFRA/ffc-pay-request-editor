const { debtData } = require('../database')

const getDebtsCount = async () => {
  const { count } = await debtData().whereNull('paymentRequestId').count({ count: '*' }).first()
  return Number(count)
}

module.exports = getDebtsCount
