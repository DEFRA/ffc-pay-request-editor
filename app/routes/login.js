const auth = require('../auth')
const statusCodes = require('../constants/status-codes')

module.exports = {
  method: 'GET',
  path: '/login',
  options: {
    auth: false
  },
  handler: async (_request, h) => {
    try {
      const authUrl = await auth.getAuthenticationUrl()
      return h.redirect(authUrl)
    } catch (err) {
      console.log('Error authenticating', err)
    }
    return h.view('500').code(statusCodes.INTERNAL_SERVER_ERROR)
  }
}
