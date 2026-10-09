const { invoiceLine } = require('../database')

const saveInvoiceLines = async (invoiceLines, paymentRequestId, transaction) => {
  for (const line of invoiceLines) {
    delete line.invoiceLineId
    await invoiceLine(transaction ?? undefined).insert({
      paymentRequestId,
      schemeCode: line.schemeCode,
      accountCode: line.accountCode,
      fundCode: line.fundCode,
      agreementNumber: line.agreementNumber,
      description: line.description,
      deliveryBody: line.deliveryBody,
      marketingYear: line.marketingYear,
      convergence: line.convergence,
      stateAid: line.stateAid,
      value: line.value
    })
  }
}

module.exports = saveInvoiceLines
