const { getDebtsCount } = require('../debt')
const { getPaymentRequestCount } = require('../payment-request')
const { getQualityChecksCount } = require('../quality-check')
const { getManualLedgerCount } = require('../manual-ledger')
const { enrichment, ledger } = require('../auth/permissions')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    auth: { scope: [enrichment, ledger] },
    handler: async (request, h) => {
      return h.view('home',
        {
          captureCount: await getDebtsCount(),
          enrichCount: await getPaymentRequestCount(),
          qualityCheckCount: await getQualityChecksCount(),
          manualLedgerCount: await getManualLedgerCount()
        })
    }
  }
}
