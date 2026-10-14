const { invoiceLine } = require('../database')
const TABLES = require('../constants/tables')
const { pickColumns } = require('../constants/columns')

const saveInvoiceLines = async (invoiceLines, paymentRequestId, transaction) => {
  for (const line of invoiceLines) {
    delete line.invoiceLineId
    await invoiceLine(transaction ?? undefined).insert(pickColumns({ ...line, paymentRequestId }, TABLES.invoiceLine))
  }
}

module.exports = saveInvoiceLines
