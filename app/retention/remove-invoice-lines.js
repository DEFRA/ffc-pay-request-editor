const { invoiceLine } = require('../database')

const removeInvoiceLines = async (paymentRequestIds, transaction) => {
  await invoiceLine(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestIds).del()
}

module.exports = {
  removeInvoiceLines
}
