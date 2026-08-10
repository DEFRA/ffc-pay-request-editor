const ViewModel = require('./models/search-combined')
const { getDebts, deleteDebt } = require('../debt')
const { mapExtract } = require('../extract')
const schema = require('./schemas/capture-by-frn-or-scheme')
const Joi = require('joi')
const { enrichment } = require('../auth/permissions')
const frnSearchLabelText = 'FRN (Firm Reference Number)'
const schemeSearchLabelText = 'Scheme'
const convertToCSV = require('../convert-to-csv')
const config = require('../config')
const options = require('../constants/scheme-names')
const statusCodes = require('../constants/status-codes')
const buildPaginationItems = require('../utils/build-pagination-items')

const defaultPage = 1
const defaultPerPage = 2500
const view = 'capture'

// Shared view-model builder used by every handler that renders the `capture` view,
// so pagination/filtering logic only lives in one place.
const buildCaptureViewData = async ({ page, perPage, frn, scheme }) => {
  const getDebtsParams = {
    includeAttached: true,
    page,
    pageSize: perPage,
    usePagination: true,
    frn,
    scheme
  }

  const result = await getDebts(getDebtsParams)
  const captureData = result.rows
  const totalPages = Math.ceil(result.count / perPage)
  const paginationItems = buildPaginationItems(page, totalPages, perPage, { frn, scheme })

  return { captureData, totalPages, paginationItems }
}

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = Number.parseInt(request.query.page) > 0 ? Number.parseInt(request.query.page) : defaultPage
      const perPage = Number.parseInt(request.query.perPage) > 0 ? Number.parseInt(request.query.perPage) : defaultPerPage
      const { frn, scheme } = request.query

      const { captureData, totalPages, paginationItems } = await buildCaptureViewData({ page, perPage, frn, scheme })

      return h.view(view, {
        captureData,
        page,
        perPage,
        totalPages,
        paginationItems,
        frn,
        scheme,
        debtAdded: request.query?.debtAdded,
        debtDeleted: request.query?.debtDeleted,
        ...new ViewModel(
          {
            id: 'user-search-frn',
            labelText: frnSearchLabelText,
            value: frn
          },
          {
            labelText: schemeSearchLabelText,
            options,
            value: scheme
          }
        )
      })
    }
  }
},
{
  method: 'POST',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const { captureData, totalPages, paginationItems } = await buildCaptureViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        const frnError = error.details.find(e => e.context.key === 'frn')
        const schemeError = error.details.find(e => e.context.key === 'scheme')

        const generalMessage = frnError?.message || schemeError?.message || ''

        return h.view(view, {
          captureData,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          frn: request.payload.frn,
          scheme: request.payload.scheme,
          ...new ViewModel(
            { labelText: frnSearchLabelText, value: request.payload.frn, error: frnError },
            { labelText: schemeSearchLabelText, options, value: request.payload.scheme, error: schemeError },
            { message: generalMessage }
          )
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      // Redirect to the GET route (POST/redirect/GET) so the search filter becomes part of the
      // URL - this means pagination on the results, and reloading/bookmarking the page, both
      // keep working with the filter applied, instead of only ever showing an unpaginated
      // in-memory-filtered result for the single POST that triggered the search.
      const { scheme, frn } = request.payload
      const params = new URLSearchParams({ page: defaultPage, perPage: defaultPerPage })
      if (frn) {
        params.set('frn', frn)
      }
      if (scheme) {
        params.set('scheme', scheme)
      }

      return h.redirect(`/capture?${params.toString()}`)
    }
  }
},
{
  method: 'POST',
  path: '/capture-delete-confirm',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const { debtdataid, frn, scheme } = request.payload
      return h.view('capture-delete-confirm', { debtdataid, frn, scheme })
    }
  }
},
{
  method: 'POST',
  path: '/capture/delete',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: Joi.object({
        debtDataId: Joi.number().integer().required()
      }),
      failAction: async (_request, h, error) => {
        const { captureData, totalPages, paginationItems } = await buildCaptureViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        const generalMessage = error.details?.[0]?.message || 'Unable to delete dataset'

        return h.view(view, {
          totalPages,
          captureData,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          ...new ViewModel(
            { labelText: frnSearchLabelText },
            { labelText: schemeSearchLabelText, options },
            { message: generalMessage }
          )
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      await deleteDebt(request.payload.debtDataId)
      return h.redirect('/capture?debtDeleted=true')
    }
  }
}, {
  method: 'GET',
  path: '/capture/extract',
  options: {
    auth: { scope: [enrichment] },
    handler: async (_request, h) => {
      const getDebtsParams = {
        includeAttached: true,
        page: defaultPage,
        pageSize: defaultPerPage,
        usePagination: false
      }
      const result = await getDebts(getDebtsParams)

      if (result.rows) {
        const extractData = mapExtract(result.rows)
        const res = convertToCSV(extractData)
        if (res) {
          // Ensure that the £ symbol is properly encoded in UTF-8
          const utf8BOM = '\uFEFF'
          const csvContent = utf8BOM + res
          return h.response(csvContent)
            .type('text/csv; charset=utf-8')
            .header('Connection', 'keep-alive')
            .header('Cache-Control', 'no-cache')
            .header('Content-Disposition', `attachment;filename=${config.debtsReportName}`)
        }
      }
      return h.view('debts-report-unavailable')
    }
  }
}]
