const hapi = require('@hapi/hapi')
const config = require('./config')
const catbox = config.useRedis ? require('@hapi/catbox-redis') : require('@hapi/catbox-memory')

const createServer = async () => {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [{
      name: config.cacheName,
      provider: {
        constructor: catbox,
        options: config.catboxOptions
      }
    }]
  })

  // Register the plugins
  if (config.processingActive) {
    await server.register(require('./plugins/auth'))
    await server.register(require('@hapi/inert'))
    await server.register(require('./plugins/views'))
    await server.register(require('./plugins/router'))
    await server.register(require('./plugins/error-pages'))
    await server.register(require('./plugins/crumb'))
    await server.register(require('./plugins/session-cache'))
    await server.register(require('./plugins/view-context'))
    await server.register(require('./plugins/logging'))
  } else {
    await server.register({
      name: 'router',
      register: (server, options) => {
        server.route([require('./routes/healthy'), require('./routes/healthz')])
      }
    })
  }

  if (config.isDev) {
    await server.register(require('blipp'))
  }

  return server
}

module.exports = createServer
