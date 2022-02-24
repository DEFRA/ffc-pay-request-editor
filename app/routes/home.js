const { getDebtsCount } = require('../debt')
const { getPaymentRequestCount } = require('../payment-request')
const { getQualityChecksCount } = require('../quality-check')

const sendCompletedRequests = require('../processing/quality-check')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    handler: async (request, h) => {
      console.log('sending message req')
      await sendCompletedRequests()

      return h.view('home',
        {
          captureCount: await getDebtsCount(),
          enrichCount: await getPaymentRequestCount(),
          qualityCheckCount: await getQualityChecksCount()
        })
    }
  }
}
