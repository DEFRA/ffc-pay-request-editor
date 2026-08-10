const ViewModel = require('./models/search')
const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const schema = require('./schemas/manual-ledger')
const { getManualLedgers } = require('../manual-ledger')
const { ledger } = require('../auth/permissions')
const { NOT_READY, FAILED } = require('../quality-check/statuses')
const statusCodes = require('../constants/status-codes')
const buildPaginationItems = require('../utils/build-pagination-items')

const statuses = [NOT_READY, FAILED]
const defaultPage = 1
const defaultPerPage = 100
const view = 'manual-ledger'

// Shared view-model builder used by every handler that renders the `manual-ledger` view,
// so pagination/filtering logic only lives in one place.
const buildLedgerViewData = async ({ page, perPage, frn }) => {
  const result = await getManualLedgers(statuses, page, perPage, true, frn)
  const ledgerData = result.rows
  const totalPages = Math.ceil(result.count / perPage)
  const paginationItems = buildPaginationItems(page, totalPages, perPage, { frn })

  return { ledgerData, totalPages, paginationItems }
}

module.exports = [{
  method: 'GET',
  path: '/manual-ledger',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const page = Number.parseInt(request.query.page) > 0 ? Number.parseInt(request.query.page) : defaultPage
      const perPage = Number.parseInt(request.query.perPage) > 0 ? Number.parseInt(request.query.perPage) : defaultPerPage
      const { frn } = request.query

      const { ledgerData, totalPages, paginationItems } = await buildLedgerViewData({ page, perPage, frn })

      return h.view(view, {
        ledgerData,
        page,
        perPage,
        totalPages,
        paginationItems,
        frn,
        checkComplete: request.query?.checkComplete,
        ...new ViewModel({ ...viewModelDetails, value: frn })
      })
    }
  }
},
{
  method: 'POST',
  path: '/manual-ledger',
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const { ledgerData, totalPages, paginationItems } = await buildLedgerViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        return h.view(view, {
          ledgerData,
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

      return h.redirect(`/manual-ledger?${params.toString()}`)
    }
  }
}]
