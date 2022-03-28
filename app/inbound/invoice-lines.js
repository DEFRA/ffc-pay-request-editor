const db = require('../data')

const saveInvoiceLines = async (invoiceLines, paymentRequestId, transaction) => {
  for (const invoiceLine of invoiceLines) {
    delete invoiceLine.invoiceLineId
    await db.invoiceLine.create({ ...invoiceLine, paymentRequestId }, { transaction })
  }
}

module.exports = saveInvoiceLines
