const { paymentRequest } = require('../database')

const getExistingPaymentRequest = async (invoiceNumber, referenceId, categoryId, transaction) => {
  const where = referenceId ? { referenceId, categoryId } : { invoiceNumber, categoryId }
  return (await paymentRequest(transaction ?? undefined).where(where).forUpdate().first()) ?? null
}

module.exports = getExistingPaymentRequest
