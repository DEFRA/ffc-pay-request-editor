const { paymentRequest, invoiceLine } = require('../database')
const TABLES = require('../constants/tables')
const getManualLedgerRequests = require('./get-manual-ledger-requests')
const { addInvoiceLineFields, addPaymentRequestFields } = require('../utils/computed-fields')

const getManualLedger = async (paymentRequestId) => {
  const row = await paymentRequest()
    .select(`${TABLES.paymentRequest}.*`, { schemeName: `${TABLES.scheme}.name` })
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.paymentRequest}.schemeId`)
    .where(`${TABLES.paymentRequest}.paymentRequestId`, paymentRequestId)
    .first()

  if (!row) {
    return {}
  }

  const manualLedgerChecks = await getManualLedgerRequests(paymentRequestId)

  // a payment request is only a manual ledger when it has an active manual ledger check
  if (manualLedgerChecks.length === 0) {
    return {}
  }

  const invoiceLines = await invoiceLine().where({ paymentRequestId }).orderBy('invoiceLineId', 'asc')
  const { schemeName, ...paymentRequestRow } = row

  return {
    ...addPaymentRequestFields(paymentRequestRow),
    schemes: { name: schemeName },
    invoiceLines: invoiceLines.map(addInvoiceLineFields),
    manualLedgerChecks
  }
}

module.exports = getManualLedger
