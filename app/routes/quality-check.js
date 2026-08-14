const ViewModel = require('./models/search')
const { getQualityChecks, getChangedQualityChecks } = require('../quality-check')
const schema = require('./schemas/quality-check')
const { ledger } = require('../auth/permissions')
const { getUser } = require('../auth')
const statusCodes = require('../constants/status-codes')
const { parsePaginationParams, withPagination, redirectWithFilters } = require('../utils/list-view')

const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const defaultPage = 1
const defaultPerPage = 100
const qualityCheck = 'quality-check'

const buildQualityCheckViewData = withPagination(async ({ page, perPage, frn }) => {
  const result = await getQualityChecks(page, perPage, true, frn)
  const data = await getChangedQualityChecks(result.rows)
  return { data, count: result.count }
})

module.exports = [{
  method: 'GET',
  path: `/${qualityCheck}`,
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const { page, perPage } = parsePaginationParams(request.query, defaultPerPage)
      const { frn } = request.query
      const { userId } = getUser(request)
      const { data: qualityCheckData, count, totalPages, paginationItems } = await buildQualityCheckViewData({ page, perPage, frn })
      return h.view(qualityCheck, {
        qualityCheckData,
        count,
        userId,
        page,
        perPage,
        totalPages,
        paginationItems,
        frn,
        checkComplete: request.query?.checkComplete,
        status: request.query?.status,
        ...new ViewModel({ ...viewModelDetails, value: frn })
      })
    }
  }
},
{
  method: 'POST',
  path: `/${qualityCheck}`,
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const { data: qualityCheckData, count, totalPages, paginationItems } = await buildQualityCheckViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })
        const { userId } = getUser(request)
        return h.view(qualityCheck, {
          qualityCheckData,
          count,
          userId,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          ...new ViewModel({ ...viewModelDetails, value: request.payload.frn }, error)
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => redirectWithFilters(h, `/${qualityCheck}`, defaultPerPage, request.payload)
  }
}]
