const ViewModel = require('./models/search')
const { getPaymentRequest } = require('../payment-request')
const schema = require('./schemas/enrich')
const { enrichment } = require('../auth/permissions')
const statusCodes = require('../constants/status-codes')
const { parsePaginationParams, withPagination, redirectWithFilters } = require('../utils/list-view')

const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const defaultPage = 1
const defaultPerPage = 100
const view = 'enrich'

const buildEnrichViewData = withPagination(async ({ page, perPage, frn }) => {
  const result = await getPaymentRequest(page, perPage, true, frn)
  return { data: result.rows, count: result.count }
})

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const { page, perPage } = parsePaginationParams(request.query, defaultPerPage)
      const { frn } = request.query
      const { data: enrichData, count, totalPages, paginationItems } = await buildEnrichViewData({ page, perPage, frn })
      return h.view(view, {
        enrichData,
        count,
        page,
        perPage,
        totalPages,
        paginationItems,
        frn,
        debtAdded: request.query?.debtAdded,
        ...new ViewModel({ ...viewModelDetails, value: frn })
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
        const { data: enrichData, count, totalPages, paginationItems } = await buildEnrichViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })
        return h.view(view, {
          enrichData,
          count,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          ...new ViewModel({ ...viewModelDetails, value: request.payload.frn }, error)
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => redirectWithFilters(h, '/enrich', defaultPerPage, request.payload)
  }
}]
