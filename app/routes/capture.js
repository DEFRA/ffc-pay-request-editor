const ViewModel = require('./models/search')
const { getDebts, deleteDebt } = require('../debt')
const { mapExtract } = require('../extract')
const schema = require('./schemas/capture')
const Joi = require('joi')
const { enrichment } = require('../auth/permissions')
const searchLabelText = 'Search for data by FRN number'
const convertToCSV = require('../convert-to-csv')
const config = require('../config')
const number1 = 1
const number2500 = 2500

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const page = parseInt(request.query.page) || number1
      const perPage = parseInt(request.query.perPage || number2500)
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
        ...new ViewModel(searchLabelText)
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
          page: number1,
          pageSize: number2500,
          usePagination: false
        }
        const captureData = await getDebts(getDebtsParams)
        return h.view('capture', { captureData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const captureData = await getDebts(true, undefined, undefined, false)
      const filteredCaptureData = captureData.filter(x => x.frn === String(frn))

      if (filteredCaptureData.length) {
        return h.view('capture', { captureData: filteredCaptureData, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('capture', new ViewModel(searchLabelText, frn, { message: 'No debts match the FRN provided.' })).code(400)
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
          page: number1,
          pageSize: number2500,
          usePagination: true
        }
        const captureData = await getDebts(getDebtsParams)
        return h.view('capture', { captureData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
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
    handler: async (request, h) => {
      try {
        const getDebtsParams = {
          includeAttached: true,
          page: number1,
          pageSize: number2500,
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
