const { getPaymentRequest } = require('../payment-request')
const { getInvoiceLinesOfPaymentRequest } = require('../invoice-line')
const { updateQualityChecksStatus } = require('../quality-check')

module.exports = [{
  method: 'GET',
  path: '/review',
  options: {
    handler: async (request, h) => {
      if (!request.query.paymentrequestid) {
        return h.redirect('/quality-check')
      }
      const paymentRequestId = parseInt(request.query.paymentrequestid)
      const allPaymentRequestData = await getPaymentRequest()
      const paymentRequestData = allPaymentRequestData.find(x => x.paymentRequestId === paymentRequestId)
      const invoiceLinesData = await getInvoiceLinesOfPaymentRequest(paymentRequestId)

      if (paymentRequestData) {
        return h.view('review', { paymentRequestData: paymentRequestData, invoiceLinesData: invoiceLinesData })
      }

      return h.redirect('/quality-check')
    }
  }
},
{
  method: 'POST',
  path: '/review',
  options: {
    handler: async (request, h) => {
      const status = request.payload.status ? request.payload.status : 'Pending'
      if (request.payload.paymentrequestid) {
        await updateQualityChecksStatus(request.payload.paymentrequestid, status)
        return h.redirect('/quality-check')
      }
      return h.redirect('/quality-check').code(301)
    }
  }
}

]