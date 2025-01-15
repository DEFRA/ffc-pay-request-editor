const statusCodes = require('../constants/status-codes')

module.exports = {
  method: 'GET',
  path: '/healthz',
  options: {
    auth: false
  },
  handler: (request, h) => {
    return h.response('ok').code(statusCodes.OK)
  }
}
