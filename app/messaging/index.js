const config = require('../config')
const processDebtDataMessage = require('./process-debt-data-message')
const processManualLedgerDataMessage = require('./process-manual-ledger-data-message')
const { MessageReceiver } = require('ffc-messaging')
let debtDataReceiver
let manualLedgerDataReceiver

const start = async () => {
  const debtDataAction = message => processDebtDataMessage(message, debtDataReceiver)
  debtDataReceiver = new MessageReceiver(config.debtSubscription, debtDataAction)
  await debtDataReceiver.subscribe()

  const manualLedgerDataAction = message => processManualLedgerDataMessage(message, manualLedgerDataReceiver)
  manualLedgerDataReceiver = new MessageReceiver(config.manualLedgerSubscription, manualLedgerDataAction)
  await manualLedgerDataReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await debtDataReceiver.closeConnection()
}

module.exports = { start, stop }
