const ViewModel = require('./models/search')
const { getPaymentRequest } = require('../payment-request')
const schema = require('./schemas/enrich')
const { enrichment } = require('../auth/permissions')
const statusCodes = require('../constants/status-codes')
const viewModelDetails = { labelText: 'Search for a request by FRN number' }

const defaultPage = 1
const defaultPerPage = 100
const view = 'enrich'

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || defaultPage
      const perPage = parseInt(request.query.perPage) || defaultPerPage
      const paymentRequest = await getPaymentRequest(page, perPage)

      return h.view(view, {
        enrichData: paymentRequest,
        page,
        perPage,
        ...new ViewModel(viewModelDetails)
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
        return h.view(view, { enrichData: paymentRequest, ...new ViewModel(viewModelDetails, request.payload.frn, error) }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const paymentRequest = await getPaymentRequest(undefined, undefined, false)
      const filteredEnrichData = paymentRequest.filter(x => x.frn === String(frn))

      if (filteredEnrichData.length) {
        return h.view(view, { enrichData: filteredEnrichData, ...new ViewModel(viewModelDetails, frn) })
      }

      return h.view(view, new ViewModel(viewModelDetails, frn, { message: 'No payments match the FRN provided.' })).code(statusCodes.BAD_REQUEST)
    }
  }
}]
