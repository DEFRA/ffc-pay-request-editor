const ViewModel = require('./models/search')
const searchLabelText = 'Search for a request by FRN number'
const schema = require('./schemas/manual-ledger')
const { getManualLedgers } = require('../manual-ledger')
const { ledger } = require('../auth/permissions')
const { NOT_READY, FAILED } = require('../quality-check/statuses')
const statuses = [NOT_READY, FAILED]

module.exports = [{
  method: 'GET',
  path: '/manual-ledger',
  options: {
    auth: { scope: [ledger] }
  },
  handler: async (request, h) => {
    const page = parseInt(request.query.page) || 1
    const perPage = parseInt(request.query.perPage || 100)
    const ledgerData = await getManualLedgers(statuses, page, perPage)
    return h.view('manual-ledger', {
      ledgerData,
      page,
      perPage,
      ...new ViewModel(searchLabelText)
    })
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
        const ledgerData = await getManualLedgers(statuses)
        return h.view('manual-ledger', { ledgerData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const ledgerData = await getManualLedgers(statuses, undefined, undefined, false)
      const filteredManualLedger = ledgerData.filter(x => x?.frn === String(frn))

      if (filteredManualLedger.length) {
        return h.view('manual-ledger', { ledgerData: filteredManualLedger, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('manual-ledger', new ViewModel(searchLabelText, frn, { message: 'No payments match the FRN provided.' })).code(400)
    }
  }
}]
