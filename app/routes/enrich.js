const ViewModel = require('./models/search')
const { getPaymentRequest } = require('../payment-request')
const schema = require('./schemas/enrich')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    handler: async (request, h) => {
      const paymentRequest = await getPaymentRequest()
      return h.view('enrich', { enrichData: paymentRequest, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/enrich',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const paymentRequest = await getPaymentRequest()
        return h.view('enrich', { enrichData: paymentRequest, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const paymentRequest = await getPaymentRequest()
      const filteredEnrichData = paymentRequest.filter(x => x.frn === frn)

      if (filteredEnrichData.length) {
        return h.view('enrich', { enrichData: filteredEnrichData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('enrich', new ViewModel(searchLabelText, frn, { message: 'No payments match the FRN provided.' })).code(400)
    }
  }
}
]
