const { getPaymentRequest } = require('../payment-request')
const { getInvoiceLinesOfPaymentRequest } = require('../invoice-line')

module.exports = [{
  method: 'GET',
  path: '/review',
  options: {
    handler: async (request, h) => {
      return h.redirect('/quality-check')
    }
  }
},
{
  method: 'POST',
  path: '/review',
  options: {
    handler: async (request, h) => {
      const paymentRequestId = parseInt(request.payload.paymentrequestid)
      const allPaymentRequestData = await getPaymentRequest()
      const paymentRequestData = allPaymentRequestData.find(x => x.paymentRequestId === paymentRequestId)
      const invoiceLinesData = await getInvoiceLinesOfPaymentRequest(paymentRequestId)

      if (paymentRequestData) {
        return h.view('review', { paymentRequestData: paymentRequestData, invoiceLinesData: invoiceLinesData })
      }

      return h.view('review').code(400)
    }
  }
}

]
