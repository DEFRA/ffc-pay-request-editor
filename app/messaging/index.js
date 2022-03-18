const { MessageReceiver, MessageSender } = require('ffc-messaging')
const config = require('../config')
const processDebtDataMessage = require('./process-debt-data-message')
const processManualLedgerDataMessage = require('./process-manual-ledger-data-message')
const { publishQualityCheckedPaymentRequests } = require('./publish-quality-checked-payment-request')
const { publishDebtPaymentRequests } = require('./publish-debt-payment-request')

let debtDataReceiver
let manualLedgerDataReceiver
let qualityCheckSender
let debtSender

const start = async () => {
  const debtDataAction = message => processDebtDataMessage(message, debtDataReceiver)
  debtDataReceiver = new MessageReceiver(config.debtSubscription, debtDataAction)
  await debtDataReceiver.subscribe()

  const manualLedgerDataAction = message => processManualLedgerDataMessage(message, manualLedgerDataReceiver)
  manualLedgerDataReceiver = new MessageReceiver(config.manualLedgerSubscription, manualLedgerDataAction)
  await manualLedgerDataReceiver.subscribe()

  qualityCheckSender = new MessageSender(config.qcTopic)
  setInterval(() => publishQualityCheckedPaymentRequests(qualityCheckSender), config.publishPollingInterval)

  debtSender = new MessageSender(config.debtResponseTopic)
  setInterval(() => publishDebtPaymentRequests(debtSender), config.publishPollingInterval)

  console.info('Ready to receive messages')
}

const stop = async () => {
  await debtDataReceiver.closeConnection()
  await qualityCheckSender.closeConnection()
}

module.exports = { start, stop }
