require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const createServer = require('./server')
const messaging = require('./messaging')

// This code requires URGENT refactoring using new templates, currently accepted due to flexi server migration.
const startApp = async () => {
  createServer()
    .then(server => server.start())
    .catch(err => {
      console.log(err)
      process.exit(1)
    })

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
