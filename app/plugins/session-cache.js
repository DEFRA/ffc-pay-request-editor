const config = require('../config')
module.exports = {
  plugin: require('@hapi/yar'),
  options: {
    storeBlank: true,
    maxCookieSize: 1,
    cookieOptions: {
      password: config.cookiePassword,
      isSecure: config.env === 'production'
    }
  }
}
