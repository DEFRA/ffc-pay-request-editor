const { debtData } = require('../database')

const getDebtData = async (paymentRequestId) => {
  return (await debtData().where({ paymentRequestId }).first()) ?? null
}

module.exports = getDebtData
