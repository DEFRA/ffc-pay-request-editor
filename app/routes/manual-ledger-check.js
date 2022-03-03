const manualLedgerMockData = require('./manual-ledger-data')

module.exports = {
  method: 'GET',
  path: '/manual-ledger-check',
  handler: async (request, h) => {
    return h.view('manual-ledger-check', { ledgerData: manualLedgerMockData })
  }
}
