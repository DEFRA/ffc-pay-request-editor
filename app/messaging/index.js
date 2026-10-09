const config = require('../config')
const { createServiceBusClient, createReceiver, subscribeReceiver, closeSenders } = require('./service-bus')
const processDebtDataMessage = require('./process-debt-data-message')
const processManualLedgerDataMessage = require('./process-manual-ledger-data-message')
const { publishQualityCheckedPaymentRequests } = require('./publish-quality-checked-payment-request')
const { publishDebtPaymentRequests } = require('./publish-debt-payment-request')
const { processRetentionMessage } = require('./process-retention-message')

const errorHandling = (error) => {
  console.error('Error occurred:', error)
}

let sbClient
let debtDataReceiver
let manualLedgerDataReceiver
let retentionReceiver
let qualityCheckSender
let debtSender

const start = async () => {
  sbClient = createServiceBusClient(config.debtSubscription)
  const debtDataAction = message => processDebtDataMessage(message, debtDataReceiver)
  debtDataReceiver = createReceiver(sbClient, config.debtSubscription)
  subscribeReceiver(debtDataReceiver, debtDataAction, errorHandling, config.debtSubscription)

  const manualLedgerDataAction = message => processManualLedgerDataMessage(message, manualLedgerDataReceiver)
  manualLedgerDataReceiver = createReceiver(sbClient, config.manualLedgerSubscription)
  subscribeReceiver(manualLedgerDataReceiver, manualLedgerDataAction, errorHandling, config.manualLedgerSubscription)

  const retentionAction = message => processRetentionMessage(message, retentionReceiver)
  retentionReceiver = createReceiver(sbClient, config.retentionSubscription)
  subscribeReceiver(retentionReceiver, retentionAction, errorHandling, config.retentionSubscription)

  qualityCheckSender = sbClient.createSender(config.qcTopic)
  setInterval(() => publishQualityCheckedPaymentRequests(qualityCheckSender), config.publishPollingInterval)

  debtSender = sbClient.createSender(config.debtResponseTopic)
  setInterval(() => publishDebtPaymentRequests(debtSender), config.publishPollingInterval)

  console.info('Ready to receive messages')
}

const stop = async () => {
  await closeSenders()
  if (sbClient) {
    try {
      await sbClient.close()
    } catch (error) {
      console.error('Error occurred while closing Service Bus client:', error)
    }
    sbClient = null
  }
}

module.exports = { start, stop }
