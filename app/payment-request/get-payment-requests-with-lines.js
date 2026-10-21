const { paymentRequest, invoiceLine, scheme } = require('../database')
const { addInvoiceLineFields, addPaymentRequestFields } = require('../utils/computed-fields')

const getPaymentRequestsWithLines = async (paymentRequestIds, { includeSchemes = false } = {}) => {
  if (paymentRequestIds.length === 0) {
    return []
  }

  const paymentRequests = await paymentRequest().whereIn('paymentRequestId', paymentRequestIds)
  const invoiceLines = await invoiceLine().whereIn('paymentRequestId', paymentRequestIds).orderBy('invoiceLineId', 'asc')
  const schemes = includeSchemes
    ? await scheme().select('schemeId', 'name').whereIn('schemeId', paymentRequests.map(x => x.schemeId).filter(x => x != null))
    : []

  return paymentRequests.map(request => {
    const withLines = {
      ...addPaymentRequestFields(request),
      invoiceLines: invoiceLines
        .filter(x => x.paymentRequestId === request.paymentRequestId)
        .map(addInvoiceLineFields)
    }
    if (includeSchemes) {
      withLines.schemes = schemes.find(x => x.schemeId === request.schemeId) ?? null
    }
    return withLines
  })
}

module.exports = getPaymentRequestsWithLines
