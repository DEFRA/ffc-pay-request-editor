const util = require('util')

const processManualLedgerDataMessage = async (message, receiver) => {
  try {
    const paymentRequest = message.body
    console.log('Payment request received for manual ledger check', util.inspect(paymentRequest, false, null, true))
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process manual ledger message:', err)
  }
}

module.exports = processManualLedgerDataMessage
