const ViewModel = require('./models/search')
const { getPaymentRequest } = require('../payment-request')
const schema = require('./schemas/enrich')
const { enrichment } = require('../auth/permissions')
const statusCodes = require('../constants/status-codes')
const buildPaginationItems = require('../utils/build-pagination-items')

const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const defaultPage = 1
const defaultPerPage = 100
const view = 'enrich'

// Shared view-model builder used by every handler that renders the `enrich` view,
// so pagination/filtering logic only lives in one place.
const buildEnrichViewData = async ({ page, perPage, frn }) => {
  const result = await getPaymentRequest(page, perPage, true, frn)
  const enrichData = result.rows
  const totalPages = Math.ceil(result.count / perPage)
  const paginationItems = buildPaginationItems(page, totalPages, perPage, { frn })

  return { enrichData, totalPages, paginationItems }
}

module.exports = [{
  method: 'GET',
  path: '/enrich',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = Number.parseInt(request.query.page) > 0 ? Number.parseInt(request.query.page) : defaultPage
      const perPage = Number.parseInt(request.query.perPage) > 0 ? Number.parseInt(request.query.perPage) : defaultPerPage
      const { frn } = request.query

      const { enrichData, totalPages, paginationItems } = await buildEnrichViewData({ page, perPage, frn })

      return h.view(view, {
        enrichData,
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
        const { enrichData, totalPages, paginationItems } = await buildEnrichViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        return h.view(view, {
          enrichData,
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

      return h.redirect(`/enrich?${params.toString()}`)
    }
  }
}]
