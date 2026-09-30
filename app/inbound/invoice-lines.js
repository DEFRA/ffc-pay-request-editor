const { invoiceLine } = require('../database')

const saveInvoiceLines = async (invoiceLines, paymentRequestId, transaction) => {
  if (invoiceLines.length === 0) {
    return
  }

  await invoiceLine(transaction ?? undefined).insert(invoiceLines.map(line => ({
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
  })))
}

module.exports = saveInvoiceLines
