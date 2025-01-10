const ViewModel = require('./models/search')
const { getQualityChecks, getChangedQualityChecks } = require('../quality-check')
const schema = require('./schemas/quality-check')
const { ledger } = require('../auth/permissions')
const { getUser } = require('../auth')
const searchLabelText = 'Search for a request by FRN number'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || 1
      const perPage = parseInt(request.query.perPage || 100)
      const qualityCheckData = await getQualityChecks(page, perPage)
      const changedQualityChecks = await getChangedQualityChecks(qualityCheckData)
      const { userId } = getUser(request)
      return h.view('quality-check', {
        qualityCheckData: changedQualityChecks,
        userId,
        page,
        perPage,
        ...new ViewModel(searchLabelText)
      })
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
        const changedQualityChecks = await getChangedQualityChecks(qualityCheckData)
        const { userId } = getUser(request)
        return h.view('quality-check', { qualityCheckData: changedQualityChecks, userId, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const qualityCheckData = await getQualityChecks(undefined, undefined, false)
      const changedQualityChecks = await getChangedQualityChecks(qualityCheckData)
      const filteredQualityCheckData = changedQualityChecks.filter(x => x?.paymentRequest?.frn === String(frn))
      const { userId } = getUser(request)

      if (filteredQualityCheckData.length) {
        return h.view('quality-check', { qualityCheckData: filteredQualityCheckData, userId, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('quality-check', { userId, ...new ViewModel(searchLabelText, frn, { message: 'No quality checks match the FRN provided.' }) }).code(400)
    }
  }
}]
