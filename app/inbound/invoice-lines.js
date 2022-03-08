const db = require('../data')

const saveInvoiceLines = async (invoiceLines, paymentRequestId) => {
  for (const invoiceLine of invoiceLines) {
    delete invoiceLine.invoiceLineId
    await db.invoiceLine.create({ ...invoiceLine, paymentRequestId })
  }
}

module.exports = saveInvoiceLines
