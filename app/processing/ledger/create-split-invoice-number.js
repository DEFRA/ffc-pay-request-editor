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
  // an invoice number is a string made up of three elements, to inject a split id character into the string we need to identify the position of those elements
  // we also need to trim the first character of the final element
  const firstElementLength = 8
  const originalFinalElementLength = 3
  const newFinalElementLength = 2
  return `${invoiceNumber.slice(0, firstElementLength)}${splitId}${invoiceNumber.slice(firstElementLength, invoiceNumber.length - originalFinalElementLength)}${invoiceNumber.slice(invoiceNumber.length - newFinalElementLength)}`
}

const createDefaultInvoiceNumber = (invoiceNumber, splitId) => {
  // an invoice number is a string made up of two elements, to inject a split id character into the string we need to identify the position of those elements
  // we also need to trim the first character of the final element
  const finalElementIndexLength = 4
  const originalFinalElementLength = 3
  const newFinalElementLength = 2
  return `${invoiceNumber.slice(0, invoiceNumber.length - finalElementIndexLength)}${splitId}${invoiceNumber.slice(invoiceNumber.length - finalElementIndexLength, invoiceNumber.length - originalFinalElementLength)}${invoiceNumber.slice(invoiceNumber.length - newFinalElementLength)}`
}

module.exports = createSplitInvoiceNumber
