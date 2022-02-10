const ViewModel = require('./models/search')
const { getQualityChecks } = require('../quality-check')
const frnSchema = require('./schemas/frn')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    handler: async (request, h) => {
      const qualityCheckData = await getQualityChecks()
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
        const qualityCheckData = await getQualityChecks()
        return h.view('quality-check', { qualityCheckData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const qualityCheckData = await getQualityChecks()
      const filteredQualityCheckData = qualityCheckData.filter(x => x.frn === frn)

      if (filteredQualityCheckData.length) {
        return h.view('quality-check', { qualityCheckData: filteredQualityCheckData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('quality-check', new ViewModel(frn, { message: 'No data matching FRN.' })).code(400)
    }
  }
}

]
