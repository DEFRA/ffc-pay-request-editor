const createSplitInvoiceNumber = (invoiceNumber, splitId, schemeId) => {
  switch (schemeId) {
    case 1:
    case 2:
    case 3:
      return createSitiAgriInvoiceNumber(invoiceNumber, splitId)
    default:
      return createDefaultInvoiceNumber(invoiceNumber, splitId)
  }
}

const createSitiAgriInvoiceNumber = (invoiceNumber, splitId) => {
  return `${invoiceNumber.slice(0, 8)}${splitId}${invoiceNumber.slice(8, invoiceNumber.length - 3)}${invoiceNumber.slice(invoiceNumber.length - 2)}`
}

const createDefaultInvoiceNumber = (invoiceNumber, splitId) => {
  return `${invoiceNumber.slice(0, invoiceNumber.length - 4)}${splitId}${invoiceNumber.slice(invoiceNumber.length - 4, invoiceNumber.length - 3)}${invoiceNumber.slice(invoiceNumber.length - 2)}`
}

module.exports = createSplitInvoiceNumber
