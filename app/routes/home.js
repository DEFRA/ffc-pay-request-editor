const captureData = require('./capture-data')
const enrichData = require('./enrich-data')
const qualityCheckData = require('./quality-check-data')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    handler: async (request, h) => {
      return h.view('home',
        {
          captureCount: captureData.length,
          enrichCount: enrichData.length,
          qualityCheck: qualityCheckData.length
        })
    }
  }
}
