const createSplitInvoiceNumber = (invoiceNumber, splitId) => {
  return `${invoiceNumber.slice(0, 8)}${splitId}${invoiceNumber.slice(8, invoiceNumber.length - 3)}${invoiceNumber.slice(invoiceNumber.length - 2)}`
}

module.exports = createSplitInvoiceNumber
