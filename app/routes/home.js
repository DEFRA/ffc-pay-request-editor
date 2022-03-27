const { getDebtsCount } = require('../debt')
const { getPaymentRequestCount } = require('../payment-request')
const { getQualityChecksCount } = require('../quality-check')
const { getManualLedgerCount } = require('../manual-ledger')
const ensureHasPermission = require('../ensure-has-permission')
const { enrichment, ledger } = require('../auth/permissions')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    handler: async (request, h) => {
      await ensureHasPermission(request, h, [enrichment, ledger])
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
