const ViewModel = require('./models/search')
const { getQualityChecks } = require('../quality-check')
const schema = require('./schemas/quality-check')
const { ledger } = require('../auth/permissions')
const getUser = require('../auth/get-user')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const qualityCheckData = await getQualityChecks()
      const { userId } = getUser(request)
      return h.view('quality-check', { qualityCheckData, userId, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const qualityCheckData = await getQualityChecks()
        const { userId } = getUser(request)
        return h.view('quality-check', { qualityCheckData, userId, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const qualityCheckData = await getQualityChecks()
      const filteredQualityCheckData = qualityCheckData.filter(x => x.frn === String(frn))
      const { userId } = getUser(request)

      if (filteredQualityCheckData.length) {
        return h.view('quality-check', { qualityCheckData: filteredQualityCheckData, userId, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('quality-check', { userId, ...new ViewModel(searchLabelText, frn, { message: 'No quality checks match the FRN provided.' }) }).code(400)
    }
  }
}]
