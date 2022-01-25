const config = require('../config')
const processDebtDataMessage = require('./process-debt-data-message')
const { MessageReceiver } = require('ffc-messaging')
let debtDataReceiver

const start = async () => {
  const debtDataAction = message => processDebtDataMessage(message, debtDataReceiver)
  debtDataReceiver = new MessageReceiver(config.debtSubscription, debtDataAction)
  await debtDataReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await debtDataReceiver.closeConnection()
}

module.exports = { start, stop }
