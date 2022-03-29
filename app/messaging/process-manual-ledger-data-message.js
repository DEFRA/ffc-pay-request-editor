const { processManualLedgerRequest } = require('../manual-ledger')
const raiseEvent = require('../event')
const util = require('util')

const processManualLedgerDataMessage = async (message, receiver) => {
  try {
    const manualLedgerRequest = message.body
    console.log('Payment request received for manual ledger check', util.inspect(manualLedgerRequest, false, null, true))
    await processManualLedgerRequest(manualLedgerRequest)
    await receiver.completeMessage(message)
    await raiseEvent({ id: 'ffc-pay-request-editor', name: 'Manual ledger received', type: 'info', message: 'Manual ledger received', data: manualLedgerRequest })
  } catch (err) {
    console.error('Unable to process manual ledger message:', err)
  }
}

module.exports = processManualLedgerDataMessage
