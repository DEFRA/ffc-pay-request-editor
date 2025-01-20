const ViewModel = require('./models/search-combined')
const { getDebts, deleteDebt } = require('../debt')
const { mapExtract } = require('../extract')
const schema = require('./schemas/capture-by-frn-or-scheme')
const Joi = require('joi')
const { enrichment } = require('../auth/permissions')
const frnSearchLabelText = 'Search for data by FRN number'
const schemeSearchLabelText = 'Search for data by scheme'
const convertToCSV = require('../convert-to-csv')
const config = require('../config')
const options = require('../constants/scheme-names')
const statusCodes = require('../constants/status-codes')

const defaultPage = 1
const defaultPerPage = 2500

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || defaultPage
      const perPage = parseInt(request.query.perPage) || defaultPerPage
      const getDebtsParams = {
        includeAttached: true,
        page,
        pageSize: perPage,
        usePagination: true
      }
      const captureData = await getDebts(getDebtsParams)
      return h.view('capture', {
        captureData,
        page,
        perPage,
        ...new ViewModel(
          {
            labelText: frnSearchLabelText
          },
          {
            labelText: schemeSearchLabelText,
            options
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
        const getDebtsParams = {
          includeAttached: true,
          page: defaultPage,
          pageSize: defaultPerPage,
          usePagination: false
        }
        const captureData = await getDebts(getDebtsParams)
        const frnError = error.details.find(e => e.context.key === 'frn')
        const schemeError = error.details.find(e => e.context.key === 'scheme')
        return h.view('capture', { captureData, page: defaultPage, perPage: defaultPerPage, ...new ViewModel({ labelText: frnSearchLabelText, value: request.payload.frn, error: frnError }, { labelText: schemeSearchLabelText, options, value: request.payload.scheme, error: schemeError }) }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { scheme, frn } = request.payload
      let captureData = await getDebts(true, undefined, undefined, false)
      if (scheme) {
        captureData = captureData.filter(x => x.schemes?.name === scheme)
      }
      if (frn) {
        captureData = captureData.filter(x => x.frn === String(frn))
      }
      if (captureData.length) {
        return h.view('capture', { captureData, page: defaultPage, perPage: defaultPerPage, ...new ViewModel({ labelText: frnSearchLabelText, value: request.payload.frn }, { labelText: schemeSearchLabelText, options, value: request.payload.scheme }) })
      }

      return h.view('capture', new ViewModel({ labelText: frnSearchLabelText, value: request.payload.frn }, { labelText: schemeSearchLabelText, options, value: request.payload.scheme }, { message: 'No records could be found for that FRN/scheme combination.' })).code(statusCodes.BAD_REQUEST)
    }
  }
}, {
  method: 'POST',
  path: '/capture/delete',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: Joi.object({
        debtDataId: Joi.number().integer().required()
      }),
      failAction: async (request, h, error) => {
        const getDebtsParams = {
          includeAttached: true,
          page: defaultPage,
          pageSize: defaultPerPage,
          usePagination: true
        }
        const captureData = await getDebts(getDebtsParams)
        return h.view('capture', { captureData, page: defaultPage, perPage: defaultPerPage, ...new ViewModel({ labelText: frnSearchLabelText, value: request.payload.frn }, { labelText: schemeSearchLabelText, options, value: request.payload.scheme }, { message: error }) }).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      await deleteDebt(request.payload.debtDataId)
      return h.redirect('/capture')
    }
  }
}, {
  method: 'GET',
  path: '/capture/extract',
  options: {
    auth: { scope: [enrichment] },
    handler: async (_request, h) => {
      try {
        const getDebtsParams = {
          includeAttached: true,
          page: defaultPage,
          pageSize: defaultPerPage,
          usePagination: false
        }
        const debts = await getDebts(getDebtsParams)
        if (debts) {
          const extractData = mapExtract(debts)
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
      } catch (err) {
        return h.view('debts-report-unavailable')
      }
    }
  }
}
]
