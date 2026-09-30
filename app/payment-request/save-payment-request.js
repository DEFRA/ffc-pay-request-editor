const { paymentRequest } = require('../database')

const savePaymentRequest = async (request, transaction) => {
  const [saved] = await paymentRequest(transaction ?? undefined)
    .insert({
      paymentRequestId: request.paymentRequestId,
      correlationId: request.correlationId,
      schemeId: request.schemeId,
      categoryId: request.categoryId,
      sourceSystem: request.sourceSystem,
      deliveryBody: request.deliveryBody,
      invoiceNumber: request.invoiceNumber,
      frn: request.frn,
      sbi: request.sbi,
      vendor: request.vendor,
      trader: request.trader,
      ledger: request.ledger,
      marketingYear: request.marketingYear,
      agreementNumber: request.agreementNumber,
      contractNumber: request.contractNumber,
      paymentRequestNumber: request.paymentRequestNumber,
      currency: request.currency,
      schedule: request.schedule,
      dueDate: request.dueDate,
      originalSettlementDate: request.originalSettlementDate,
      originalInvoiceNumber: request.originalInvoiceNumber,
      invoiceCorrectionReference: request.invoiceCorrectionReference,
      exchangeRate: request.exchangeRate,
      eventDate: request.eventDate,
      claimDate: request.claimDate,
      value: request.value,
      netValue: request.netValue,
      received: new Date(),
      released: request.released,
      referenceId: request.referenceId,
      fesCode: request.fesCode,
      annualValue: request.annualValue,
      remittanceDescription: request.remittanceDescription,
      providesAccountingValues: request.providesAccountingValues
    })
    .returning('paymentRequestId')
  return saved
}

module.exports = savePaymentRequest
