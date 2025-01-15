const statusCodes = require('../constants/status-codes')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    auth: false
  },
  handler: (_request, h) => {
    return h.response('ok').code(statusCodes.OK)
  }
}
