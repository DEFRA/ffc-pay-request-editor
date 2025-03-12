require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const createServer = require('./server')

const startApp = async () => {
  if (config.processingActive) {
    createServer()
      .then(server => server.start())
      .catch(err => {
        console.log(err)
        process.exit(1)
      })
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

(async () => {
  await startApp()
})()

module.exports = startApp
