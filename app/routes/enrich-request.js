const { getPaymentRequestByInvoiceNumber } = require('../payment-request')
const { saveDebt } = require('../debt')
const { updateQualityChecksStatus } = require('../quality-check')
const format = require('../utils/date-formatter')
const ViewModel = require('./models/enrich-request')
const enrichRequestSchema = require('./schemas/enrich-request')
const dateSchema = require('./schemas/date')

module.exports = [{
  method: 'GET',
  path: '/enrich-request',
  options: {
    handler: async (request, h) => {
      const invoiceNumber = request.query.invoiceNumber
      if (!invoiceNumber) {
        return h.view('404')
      }

      const paymentRequest = await getPaymentRequestByInvoiceNumber(invoiceNumber)
      if (!paymentRequest) {
        console.log(`No records with invoiceNumber: ${invoiceNumber} are present in the database`)
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
    handler: async (request, h) => {
      const payload = request.payload

      const invoiceNumber = payload['invoice-number']
      const paymentRequest = await getPaymentRequestByInvoiceNumber(invoiceNumber)

      const enrichRequestValidation = enrichRequestSchema.validate(payload, { abortEarly: false })
      if (enrichRequestValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, enrichRequestValidation.error) }).code(400).takeover()
      }

      const day = format(payload.day)
      const month = format(payload.month)
      const year = payload.year

      const dateValidation = dateSchema.validate({
        date: `${year}-${month}-${day}`
      })

      if (dateValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, dateValidation.error) }).code(400).takeover()
      }

      if (paymentRequest.released) {
        console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
        return h.redirect('/enrich')
      }

      await saveDebt({
        paymentRequestId: paymentRequest.paymentRequestId,
        schemeId: paymentRequest.schemeId,
        frn: paymentRequest.frn,
        debtType: payload['debt-type'],
        recoveryDate: `${day}/${month}/${year}`,
        createdDate: new Date()
      })

      await updateQualityChecksStatus(paymentRequest.paymentRequestId, 'Pending')

      return h.redirect('/enrich')
    }
  }
}
]
