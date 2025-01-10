const ViewModel = require('./models/search')
const { getPaymentRequest } = require('../payment-request')
const schema = require('./schemas/enrich')
const { enrichment } = require('../auth/permissions')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || 1
      const perPage = parseInt(request.query.perPage || 100)
      const paymentRequest = await getPaymentRequest(page, perPage)
      return h.view('enrich', {
        enrichData: paymentRequest,
        page,
        perPage,
        ...new ViewModel(searchLabelText)
      })
    }
  }
},
{
  method: 'POST',
  path: '/enrich',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const paymentRequest = await getPaymentRequest()
        return h.view('enrich', { enrichData: paymentRequest, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const paymentRequest = await getPaymentRequest(undefined, undefined, false)
      const filteredEnrichData = paymentRequest.filter(x => x.frn === String(frn))

      if (filteredEnrichData.length) {
        return h.view('enrich', { enrichData: filteredEnrichData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('enrich', new ViewModel(searchLabelText, frn, { message: 'No payments match the FRN provided.' })).code(400)
    }
  }
}]
