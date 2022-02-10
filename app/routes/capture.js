const ViewModel = require('./models/search')
const { getDebts } = require('../debt')
const frnSchema = require('./schemas/frn')
const searchLabelText = 'Search for data by FRN number'

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    handler: async (request, h) => {
      const captureData = await getDebts()
      return h.view('capture', { captureData, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/capture',
  options: {
    validate: {
      payload: frnSchema,
      failAction: async (request, h, error) => {
        const captureData = await getDebts()
        return h.view('capture', { captureData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const captureData = await getDebts()
      const filteredCaptureData = captureData.filter(x => x.frn === frn)

      if (filteredCaptureData.length) {
        return h.view('capture', { captureData: filteredCaptureData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('capture', new ViewModel(frn, { message: 'No data matching FRN.' })).code(400)
    }
  }
}
]
