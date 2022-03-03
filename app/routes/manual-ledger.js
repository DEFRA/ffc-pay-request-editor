const ViewModel = require('./models/search')
const searchLabelText = 'Search for a request by FRN number'
const manualLedgerMockData = require('./manual-ledger-check-data')
const schema = require('./schemas/manual-ledger')

module.exports = [{
  method: 'GET',
  path: '/manual-ledger',
  handler: async (request, h) => {
    return h.view('manual-ledger', { ledgerData: manualLedgerMockData, ...new ViewModel(searchLabelText) })
  }
},
{
  method: 'POST',
  path: '/manual-ledger',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        return h.view('manual-ledger', { ledgerData: manualLedgerMockData, ...new ViewModel(searchLabelText, request.payload.frn, error) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const frn = request.payload.frn
      const filteredManualLedger = manualLedgerMockData.filter(x => x.paymentRequest.frn === String(frn))

      if (filteredManualLedger.length) {
        return h.view('manual-ledger', { ledgerData: filteredManualLedger, ...new ViewModel(searchLabelText, frn) })
      }

      return h.view('manual-ledger', new ViewModel(searchLabelText, frn, { message: 'No payments match the FRN provided.' })).code(400)
    }
  }
}
]
