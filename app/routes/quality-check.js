const ViewModel = require('./models/search')
const qualityCheckData = require('./quality-check-data')
const frnSchema = require('./schemas/frn')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    handler: async (request, h) => {
      return h.view('quality-check', { qualityCheckData, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/quality-check',
  options: {
    validate: {
      payload: frnSchema,
      failAction: async (request, h, error) => {
        return h.view('quality-check', { qualityCheckData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const filteredQualityCheckData = qualityCheckData.filter(x => x.frn === frn)

      if (filteredQualityCheckData.length) {
        return h.view('quality-check', { qualityCheckData: filteredQualityCheckData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('quality-check', new ViewModel(frn, { message: 'No data matching FRN.' })).code(400)
    }
  }
}

]
