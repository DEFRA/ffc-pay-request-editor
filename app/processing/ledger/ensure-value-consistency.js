const ensureValueConsistency = (paymentRequest) => {
  // ensure no value gained or lost. if variation between total and lines apply difference to first gross line
  const invoiceLineTotal = getInvoiceLineTotal(paymentRequest)
  const variation = Math.abs(paymentRequest.value) - Math.abs(invoiceLineTotal)
  if (variation !== 0) {
    const firstGrossLineIndex = paymentRequest.invoiceLines.findIndex(x => x.description.startsWith('G00'))
    paymentRequest.invoiceLines[firstGrossLineIndex].value += variation
  }
}

const getInvoiceLineTotal = (paymentRequest) => {
  return (paymentRequest.invoiceLines.reduce((x, y) => x + y.value, 0))
}

module.exports = ensureValueConsistency
