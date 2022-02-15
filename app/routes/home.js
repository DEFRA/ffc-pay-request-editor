const { getDebtsCount } = require('../debt')
const { getPaymentRequestCount } = require('../payment-request')
const { getQualityChecksCount } = require('../quality-check')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    handler: async (request, h) => {
      return h.view('home',
        {
          captureCount: await getDebtsCount(),
          enrichCount: await getPaymentRequestCount(),
          qualityCheck: await getQualityChecksCount()
        })
    }
  }
}
