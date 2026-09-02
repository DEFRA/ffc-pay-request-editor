const hapi = require('@hapi/hapi')
const config = require('./config')

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
    }
  })

  // Register the plugins
  if (config.processingActive) {
    await server.register(require('./plugins/auth'))
    await server.register(require('@hapi/inert'))
    await server.register(require('./plugins/views'))
    await server.register(require('./plugins/router'))
    await server.register(require('./plugins/error-pages'))
    await server.register(require('./plugins/session-cache'))
    await server.register(require('./plugins/crumb'))
    await server.register(require('./plugins/view-context'))
    await server.register(require('./plugins/logging'))
    await server.register(require('./plugins/cookies'))
  } else {
    await server.register({
      name: 'router',
      register: (svr, _opts) => {
        svr.route([require('./routes/healthy'), require('./routes/healthz')])
      }
    })
  }

  if (config.isDev) {
    await server.register(require('blipp'))
  }

  return server
}

module.exports = createServer
