const ViewModel = require('./models/search')
const { getDebts, deleteDebt } = require('../debt')
const schema = require('./schemas/capture')
const Joi = require('joi')
const { enrichment } = require('../auth/permissions')
const searchLabelText = 'Search for data by FRN number'

module.exports = [{
  method: 'GET',
  path: '/capture',
  options: {
    auth: { scope: [enrichment] },
    handler: async (_request, h) => {
      const captureData = await getDebts(true)
      return h.view('capture', { captureData, ...new ViewModel(searchLabelText) })
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
        const captureData = await getDebts(true)
        return h.view('capture', { captureData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const captureData = await getDebts(true)
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
        const captureData = await getDebts(true)
        return h.view('capture', { captureData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      await deleteDebt(request.payload.debtDataId)
      return h.redirect('/capture')
    }
  }
}]
