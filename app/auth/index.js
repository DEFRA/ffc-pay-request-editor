const config = require('../config').authConfig
const auth = config.enabled ? require('./azure-auth') : require('./dev-auth')
const mapAuth = require('./map-auth')

module.exports = {
  ...auth,
  mapAuth
}
