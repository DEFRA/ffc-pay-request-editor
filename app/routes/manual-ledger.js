const ViewModel = require('./models/search')
const searchLabelText = 'Search for a request by FRN number'
const schema = require('./schemas/manual-ledger')
const { getManualLedgers } = require('../manual-ledger')
const { ledgerAmend } = require('../auth/permissions')
const ensureHasPermission = require('../ensure-has-permission')
const statuses = ['Not ready', 'Failed']

module.exports = [{
  method: 'GET',
  path: '/manual-ledger',
  options: {
  },
  handler: async (request, h) => {
    await ensureHasPermission(request, h, [ledgerAmend])
    const ledgerData = await getManualLedgers(statuses)
    return h.view('manual-ledger', { ledgerData, ...new ViewModel(searchLabelText) })
  }
},
{
  method: 'POST',
  path: '/manual-ledger',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        await ensureHasPermission(request, h, [ledgerAmend])
        const ledgerData = await getManualLedgers(statuses)
        return h.view('manual-ledger', { ledgerData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      await ensureHasPermission(request, h, [ledgerAmend])
      const frn = request.payload.frn
      const ledgerData = await getManualLedgers(statuses)
      const filteredManualLedger = ledgerData.filter(x => x.paymentRequest?.frn === String(frn))

      if (filteredManualLedger.length) {
        return h.view('manual-ledger', { ledgerData: filteredManualLedger, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('manual-ledger', new ViewModel(searchLabelText, frn, { message: 'No payments match the FRN provided.' })).code(400)
    }
  }
}
]
