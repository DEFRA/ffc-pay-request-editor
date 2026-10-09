const { invoiceLine } = require('../database')
const TABLES = require('../constants/tables')

const getInvoiceLinesOfPaymentRequest = async (paymentRequestId) => {
  const rows = await invoiceLine()
    .select(
      `${TABLES.invoiceLine}.invoiceLineId`,
      `${TABLES.invoiceLine}.schemeCode`,
      `${TABLES.invoiceLine}.accountCode`,
      `${TABLES.invoiceLine}.fundCode`,
      `${TABLES.invoiceLine}.description`,
      `${TABLES.invoiceLine}.value`,
      { requestFrn: `${TABLES.paymentRequest}.frn` },
      { requestAgreementNumber: `${TABLES.paymentRequest}.agreementNumber` },
      { requestInvoiceNumber: `${TABLES.paymentRequest}.invoiceNumber` },
      { requestPaymentRequestNumber: `${TABLES.paymentRequest}.paymentRequestNumber` },
      { requestValue: `${TABLES.paymentRequest}.value` },
      { schemeName: `${TABLES.scheme}.name` }
    )
    .leftJoin(TABLES.paymentRequest, `${TABLES.paymentRequest}.paymentRequestId`, `${TABLES.invoiceLine}.paymentRequestId`)
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.paymentRequest}.schemeId`)
    .where(`${TABLES.invoiceLine}.paymentRequestId`, paymentRequestId)

  return rows.map(({ requestFrn, requestAgreementNumber, requestInvoiceNumber, requestPaymentRequestNumber, requestValue, schemeName, ...line }) => ({
    ...line,
    paymentRequest: {
      frn: requestFrn,
      agreementNumber: requestAgreementNumber,
      invoiceNumber: requestInvoiceNumber,
      paymentRequestNumber: requestPaymentRequestNumber,
      value: requestValue,
      schemes: { name: schemeName }
    }
  }))
}

module.exports = getInvoiceLinesOfPaymentRequest
