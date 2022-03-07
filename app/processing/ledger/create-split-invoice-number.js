const createSplitInvoiceNumber = (invoiceNumber, splitId) => {
  return `${invoiceNumber.slice(0, 9)}${splitId}${invoiceNumber.slice(9, invoiceNumber.length - 3)}${invoiceNumber.slice(invoiceNumber.length - 2)}`
}

module.exports = createSplitInvoiceNumber
