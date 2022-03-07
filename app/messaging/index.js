const { MessageReceiver, MessageSender } = require('ffc-messaging')
const config = require('../config')
const processDebtDataMessage = require('./process-debt-data-message')
const { publishQualityCheckedPaymentRequests } = require('./publish-quality-checked-payment-request')

let debtDataReceiver
let qualityCheckSender

const start = async () => {
  const debtDataAction = message => processDebtDataMessage(message, debtDataReceiver)
  debtDataReceiver = new MessageReceiver(config.debtSubscription, debtDataAction)
  await debtDataReceiver.subscribe()

  qualityCheckSender = new MessageSender(config.qcTopic)
  setInterval(() => publishQualityCheckedPaymentRequests(qualityCheckSender), config.publishPollingInterval)

  console.info('Ready to receive messages')
}

const stop = async () => {
  await debtDataReceiver.closeConnection()
  await qualityCheckSender.closeConnection()
}

module.exports = { start, stop }
