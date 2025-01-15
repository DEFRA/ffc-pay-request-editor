const ViewModel = require('./models/search')
const { getQualityChecks, getChangedQualityChecks } = require('../quality-check')
const schema = require('./schemas/quality-check')
const { ledger } = require('../auth/permissions')
const { getUser } = require('../auth')
const statusCodes = require('../constants/status-codes')
const searchLabelText = 'Search for a request by FRN number'

const defaultPage = 1
const defaultPerPage = 100
const view = 'quality-check'

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || defaultPage
      const perPage = parseInt(request.query.perPage) || defaultPerPage
      const qualityCheckData = await getQualityChecks(page, perPage)
      const changedQualityChecks = await getChangedQualityChecks(qualityCheckData)
      const { userId } = getUser(request)
      return h.view(view, {
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
        return h.view(view, { qualityCheckData: changedQualityChecks, userId, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const qualityCheckData = await getQualityChecks(undefined, undefined, false)
      const changedQualityChecks = await getChangedQualityChecks(qualityCheckData)
      const filteredQualityCheckData = changedQualityChecks.filter(x => x?.paymentRequest?.frn === String(frn))
      const { userId } = getUser(request)

      if (filteredQualityCheckData.length) {
        return h.view(view, { qualityCheckData: filteredQualityCheckData, userId, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view(view, { userId, ...new ViewModel(searchLabelText, frn, { message: 'No quality checks match the FRN provided.' }) }).code(statusCodes.BAD_REQUEST)
    }
  }
}]
