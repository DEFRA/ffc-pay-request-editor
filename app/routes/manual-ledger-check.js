const { getManualLedger } = require('../manual-ledger')
const splitToLedger = require('../processing/ledger/split-to-ledger')

module.exports = [{
  method: 'GET',
  path: '/manual-ledger-check',
  options: {
    handler: async (request, h) => {
      const paymentRequestId = parseInt(request.query.paymentrequestid)
      if (!paymentRequestId) {
        return h.view('404')
      }

      const manualLedgerData = await getManualLedger(paymentRequestId)
      manualLedgerData.arAutoValue = 0
      manualLedgerData.apAutoValue = 0
      const ledgerPaymentRequests = manualLedgerData.manualLedgerChecks

      for (const manualLedgerCheck of ledgerPaymentRequests) {
        manualLedgerData[`${manualLedgerCheck.ledgerPaymentRequest.ledger.toLowerCase()}AutoValue`] = manualLedgerCheck.ledgerPaymentRequest.value
      }

      console.log('Manual ledger data', manualLedgerData)

      if (!manualLedgerData) {
        console.log(`No manual ledger record with paymentRequestId: ${paymentRequestId} exists in the database`)
        return h.view('404')
      }

      return h.view('manual-ledger-check', { manualLedgerData })
    }
  }
},
{
  method: 'POST',
  path: '/manual-ledger-check',
  options: {
    handler: async (request, h) => {
      const { paymentRequestId, arValue } = request.payload
      const manualLedgerData = await getManualLedger(paymentRequestId)
      const deltaManualLedgerData = manualLedgerData.manualLedgerChecks.find(ml => ml.ledgerPaymentRequest.ledger === 'AR')
      const splitLedger = await splitToLedger(deltaManualLedgerData.ledgerPaymentRequest, arValue, 'ar')
      return h.view('manual-ledger-check')
    }
  }
}]
