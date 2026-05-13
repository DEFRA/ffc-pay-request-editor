const { processManualLedgerRequest } = require('../manual-ledger')

const processManualLedgerDataMessage = async (message, receiver) => {
  try {
    const manualLedgerRequest = message.body
    console.log('Payment request received for manual ledger check', { frn: manualLedgerRequest.frn, sbi: manualLedgerRequest.sbi, invoiceNumber: manualLedgerRequest.invoiceNumber })
    await processManualLedgerRequest(manualLedgerRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process manual ledger message:', err)
  }
}

module.exports = processManualLedgerDataMessage
