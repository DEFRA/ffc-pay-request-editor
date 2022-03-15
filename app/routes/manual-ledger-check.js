const Joi = require('joi')
const { getManualLedger } = require('../manual-ledger')
const ViewModel = require('./models/manual-ledger')
const splitToLedger = require('../processing/ledger/split-to-ledger')
const { updateQualityChecksStatus } = require('../quality-check')
const { convertToPence, convertToPounds } = require('../currency-convert')

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

      if (!manualLedgerData) {
        console.log(`No manual ledger record with paymentRequestId: ${paymentRequestId} exists in the database`)
        return h.view('404')
      }

      return h.view('manual-ledger-check', new ViewModel(manualLedgerData))
    }
  }
},
{
  method: 'GET',
  path: '/manual-ledger-check/calculate',
  options: {
    handler: async (request, h) => {
      const paymentRequestId = request.query.paymentRequestId
      const arValue = request.query['ar-value']
      const manualLedgerData = await getManualLedger(paymentRequestId)
      const splitLedger = await splitToLedger(manualLedgerData, convertToPence(arValue), 'AR')
      manualLedgerData.manualLedgerChecks = []
      manualLedgerData.manualLedgerChecks = splitLedger.map(ledger => {
        ledger.valueDecimal = convertToPounds(ledger.value)
        return {
          ledgerPaymentRequest: ledger
        }
      })

      return h.view('manual-ledger-check', new ViewModel(manualLedgerData))
    }
  }
},
{
  method: 'POST',
  path: '/manual-ledger-check',
  options: {
    validate: {
      payload: Joi.object({
        paymentRequestId: Joi.string().required(),
        agree: Joi.boolean().required()
      }),
      failAction: async (request, h, error) => {
        const { paymentRequestId } = request.payload
        const manualLedgerData = await getManualLedger(paymentRequestId)
        return h.view('manual-ledger-check', new ViewModel(manualLedgerData, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { paymentRequestId, agree } = request.payload

      if (!agree) {
        const manualLedgerData = await getManualLedger(paymentRequestId)
        return h.view('manual-ledger-check', { ...new ViewModel(manualLedgerData), showLedgerSplit: true }).code(400).takeover()
      }

      await updateQualityChecksStatus(paymentRequestId, 'Pending')
      return h.redirect('/quality-check')
    }
  }
}]
