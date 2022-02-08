const ViewModel = require('./models/search')
const enrichData = require('./enrich-data')
const frnSchema = require('./schemas/frn')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    handler: async (request, h) => {
      return h.view('enrich', { enrichData, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/enrich',
  options: {
    validate: {
      payload: frnSchema,
      failAction: async (request, h, error) => {
        return h.view('enrich', { enrichData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const filteredEnrichData = enrichData.filter(x => x.frn === frn)

      if (filteredEnrichData.length) {
        return h.view('enrich', { enrichData: filteredEnrichData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('enrich', new ViewModel(frn, { message: 'No data matching FRN.' })).code(400)
    }
  }
}
]
