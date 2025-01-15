const { getPaymentRequestByInvoiceNumberAndRequestId } = require('../payment-request')
const ViewModel = require('./models/enrich-request')
const enrichRequestSchema = require('./schemas/enrich-request')
const { enrichment } = require('../auth/permissions')
const { getUser } = require('../auth')
const { enrichRequest } = require('../processing/enrich')
const { validateDate } = require('../processing/validate-date')
const statusCodes = require('../constants/status-codes')

module.exports = [{
  method: 'GET',
  path: '/enrich-request',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const invoiceNumber = request.query.invoiceNumber
      const paymentRequestId = parseInt(request.query.paymentRequestId)

      if (!invoiceNumber || !paymentRequestId) {
        return h.view('404')
      }

      const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)
      if (!paymentRequest) {
        console.log(`No  records with invoiceNumber: ${invoiceNumber} are present in the database`)
        return h.view('404')
      }

      if (paymentRequest.released) {
        console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
        return h.view('404')
      }

      return h.view('enrich-request', { paymentRequest, ...new ViewModel() })
    }
  }
},
{
  method: 'POST',
  path: '/enrich-request',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const payload = request.payload

      const invoiceNumber = payload['invoice-number']
      const paymentRequestId = parseInt(payload['payment-request-id'])

      const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)

      const enrichRequestValidation = enrichRequestSchema.validate(payload, { abortEarly: false })
      if (enrichRequestValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, enrichRequestValidation.error) }).code(statusCodes.BAD_REQUEST).takeover()
      }

      const dateError = await validateDate(payload, paymentRequest.received)
      if (dateError) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, dateError) }).code(400).takeover()
      }

      if (paymentRequest.released) {
        console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
        return h.redirect('/enrich')
      }

      const user = getUser(request)
      await enrichRequest(user, payload, paymentRequest)

      return h.redirect('/enrich')
    }
  }
}
]
