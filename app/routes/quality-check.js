const ViewModel = require('./models/search')
const { getQualityChecks } = require('../quality-check')
const status = require('../status')
const schema = require('./schemas/quality-check')
const ensureHasPermission = require('../ensure-has-permission')
const { ledgerCheck } = require('../auth/permissions')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    handler: async (request, h) => {
      await ensureHasPermission(request, h, [ledgerCheck])
      const qualityCheckData = await getQualityChecks()
      return h.view('quality-check', { status, qualityCheckData, ...new ViewModel(searchLabelText) })
    }
  }
},
{
  method: 'POST',
  path: '/quality-check',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        await ensureHasPermission(request, h, [ledgerCheck])
        const qualityCheckData = await getQualityChecks()
        return h.view('quality-check', { status, qualityCheckData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      await ensureHasPermission(request, h, [ledgerCheck])
      const frn = request.payload.frn
      const qualityCheckData = await getQualityChecks()
      const filteredQualityCheckData = qualityCheckData.filter(x => x.frn === String(frn))

      if (filteredQualityCheckData.length) {
        return h.view('quality-check', { status, qualityCheckData: filteredQualityCheckData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('quality-check', { status, ...new ViewModel(searchLabelText, frn, { message: 'No quality checks match the FRN provided.' }) }).code(400)
    }
  }
}]
