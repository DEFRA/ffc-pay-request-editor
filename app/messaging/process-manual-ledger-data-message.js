const { processManualLedgerRequest } = require('../manual-ledger')
const util = require('util')

const processManualLedgerDataMessage = async (message, receiver) => {
  try {
    const manualLedgerRequest = message.body
    console.log('Payment request received for manual ledger check', util.inspect(manualLedgerRequest, false, null, true))
    await processManualLedgerRequest(manualLedgerRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process manual ledger message:', err)
  }
}

module.exports = processManualLedgerDataMessage
