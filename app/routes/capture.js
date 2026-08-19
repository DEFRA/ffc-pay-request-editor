const ViewModel = require('./models/search-combined')
const { getDebts, deleteDebt } = require('../debt')
const { mapExtract } = require('../extract')
const schema = require('./schemas/capture-by-frn-or-scheme')
const Joi = require('joi')
const { enrichment } = require('../auth/permissions')
const convertToCSV = require('../convert-to-csv')
const config = require('../config')
const options = require('../constants/scheme-names')
const statusCodes = require('../constants/status-codes')
const { parsePaginationParams, withPagination, redirectWithFilters } = require('../utils/list-view')

const frnSearchLabelText = 'FRN (Firm Reference Number)'
const schemeSearchLabelText = 'Scheme'
const defaultPage = 1
const defaultPerPage = 2500
const view = 'capture'

const buildCaptureViewData = withPagination(async ({ page, perPage, frn, scheme }) => {
  const result = await getDebts({
    includeAttached: true,
    page,
    pageSize: perPage,
    usePagination: true,
    frn,
    scheme
  })
  return { data: result.rows, count: result.count }
})

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const { page, perPage } = parsePaginationParams(request.query, defaultPerPage)
      const { frn, scheme } = request.query

      const { data: captureData, count, totalPages, paginationItems } = await buildCaptureViewData({ page, perPage, frn, scheme })

      return h.view(view, {
        captureData,
        count,
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
        const { data: captureData, count, totalPages, paginationItems } = await buildCaptureViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        const frnError = error.details.find(e => e.context.key === 'frn')
        const schemeError = error.details.find(e => e.context.key === 'scheme')
        const generalMessage = frnError?.message || schemeError?.message || ''

        return h.view(view, {
          captureData,
          count,
          totalPages,
          paginationItems,
          page: defaultPage,
          perPage: defaultPerPage,
          frn: request.payload.frn,
          scheme: request.payload.scheme,
          errors: error.details,
          ...new ViewModel(
            { labelText: frnSearchLabelText, value: request.payload.frn, error: frnError },
            { labelText: schemeSearchLabelText, options, value: request.payload.scheme, error: schemeError },
            { message: generalMessage }
          )
        }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => redirectWithFilters(h, '/capture', defaultPerPage, request.payload)
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
        const { data: captureData, count, totalPages, paginationItems } = await buildCaptureViewData({
          page: defaultPage,
          perPage: defaultPerPage
        })

        const generalMessage = error.details?.[0]?.message || 'Unable to delete dataset'

        return h.view(view, {
          totalPages,
          captureData,
          count,
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
      const result = await getDebts({
        includeAttached: true,
        page: defaultPage,
        pageSize: defaultPerPage,
        usePagination: false
      })

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
