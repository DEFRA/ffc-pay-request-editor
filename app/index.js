require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const messaging = require('./messaging')

const startServer = require('./start-server')
const { updateSchemesDatabase } = require('./update-schemes-database')

const startApp = async () => {
  startServer()
  await updateSchemesDatabase()
  if (config.processingActive) {
    await messaging.start()
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

(async () => {
  await startApp()
})()

module.exports = startApp
