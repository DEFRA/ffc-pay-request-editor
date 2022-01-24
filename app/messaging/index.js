const config = require('../config')
const processQualityCheckMessage = require('./process-quality-check-message')
const { MessageReceiver } = require('ffc-messaging')
let qualityCheckReceiver

const start = async () => {
  const qualityCheckAction = message => processQualityCheckMessage(message, qualityCheckReceiver)
  qualityCheckReceiver = new MessageReceiver(config.qcSubscription, qualityCheckAction)
  await qualityCheckReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await qualityCheckReceiver.closeConnection()
}

module.exports = { start, stop }
