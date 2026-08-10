const ViewModel = require('./models/search')
const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const { getQualityChecks, getChangedQualityChecks } = require('../quality-check')
const schema = require('./schemas/quality-check')
const { ledger } = require('../auth/permissions')
const { getUser } = require('../auth')
const statusCodes = require('../constants/status-codes')
const buildPaginationItems = require('../utils/build-pagination-items')

const defaultPage = 1
const defaultPerPage = 100
const view = 'quality-check'

// Shared view-model builder used by every handler that renders the `quality-check` view,
// so pagination/filtering logic only lives in one place.
const buildQualityCheckViewData = async ({ page, perPage, frn }) => {
  const result = await getQualityChecks(page, perPage, true, frn)
  const qualityCheckData = await getChangedQualityChecks(result.rows)
  const totalPages = Math.ceil(result.count / perPage)
  const paginationItems = buildPaginationItems(page, totalPages, perPage, { frn })

  return { qualityCheckData, totalPages, paginationItems }
}

module.exports = [{
  method: 'GET',
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const page = Number.parseInt(request.query.page) > 0 ? Number.parseInt(request.query.page) : defaultPage
      const perPage = Number.parseInt(request.query.perPage) > 0 ? Number.parseInt(request.query.perPage) : defaultPerPage
      const { frn } = request.query
      const { userId } = getUser(request)

      const { qualityCheckData, totalPages, paginationItems } = await buildQualityCheckViewData({ page, perPage, frn })

      return h.view(view, {
        qualityCheckData,
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
  path: '/quality-check',
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const { qualityCheckData, totalPages, paginationItems } = await buildQualityCheckViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })
        const { userId } = getUser(request)

        return h.view(view, {
          qualityCheckData,
          userId,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          ...new ViewModel({ ...viewModelDetails, value: request.payload.frn }, error)
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      // Redirect to the GET route (POST/redirect/GET) so the search filter becomes part of the
      // URL - this means pagination on the results, and reloading/bookmarking the page, both
      // keep working with the filter applied, instead of only ever showing an unpaginated
      // in-memory-filtered result for the single POST that triggered the search.
      const { frn } = request.payload
      const params = new URLSearchParams({ page: defaultPage, perPage: defaultPerPage })
      if (frn) {
        params.set('frn', frn)
      }

      return h.redirect(`/quality-check?${params.toString()}`)
    }
  }
}]
