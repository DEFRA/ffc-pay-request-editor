const ViewModel = require('./models/search')
const schema = require('./schemas/manual-ledger')
const { getManualLedgers } = require('../manual-ledger')
const { ledger } = require('../auth/permissions')
const { NOT_READY, FAILED } = require('../quality-check/statuses')
const statusCodes = require('../constants/status-codes')
const { parsePaginationParams, withPagination, redirectWithFilters } = require('../utils/list-view')

const viewModelDetails = { labelText: 'FRN (Firm Reference Number)' }
const statuses = [NOT_READY, FAILED]
const defaultPage = 1
const defaultPerPage = 100

const manualLedger = 'manual-ledger'

const buildLedgerViewData = withPagination(async ({ page, perPage, frn }) => {
  const result = await getManualLedgers(statuses, page, perPage, true, frn)
  return { data: result.rows, count: result.count }
})

module.exports = [{
  method: 'GET',
  path: `/${manualLedger}`,
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const { page, perPage } = parsePaginationParams(request.query, defaultPerPage)
      const { frn } = request.query
      const { data: ledgerData, count, totalPages, paginationItems } = await buildLedgerViewData({ page, perPage, frn })

      return h.view(manualLedger, {
        ledgerData,
        count,
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
  path: `/${manualLedger}`,
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const { data: ledgerData, count, totalPages, paginationItems } = await buildLedgerViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        return h.view(manualLedger, {
          ledgerData,
          count,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          ...new ViewModel({ ...viewModelDetails, value: request.payload.frn }, error)
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) =>
      redirectWithFilters(h, `/${manualLedger}`, defaultPerPage, request.payload)
  }
}]
