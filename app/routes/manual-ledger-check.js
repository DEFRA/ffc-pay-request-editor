const Joi = require('joi')
const { getManualLedger, calculateManualLedger, saveCalculatedManualLedger } = require('../manual-ledger')
const ViewModel = require('./models/manual-ledger-check')
const { updateQualityChecksStatus } = require('../quality-check')
const { convertToPence } = require('../currency-convert')
const sessionHandler = require('../session-handler')
const sessionKey = 'provisionalLedgerData'

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
      sessionHandler.clear(request, sessionKey)
      const paymentRequestId = request.query.paymentRequestId
      const arValue = convertToPence(request.query['ar-value'])
      const manualLedgerData = await calculateManualLedger(paymentRequestId, arValue)
      sessionHandler.set(request, sessionKey, { paymentRequestId, provisionalLedgerData: manualLedgerData.manualLedgerChecks })
      return h.view('manual-ledger-check', { ...new ViewModel(manualLedgerData), provisionalValue: arValue })
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
      }).options({ allowUnknown: true }),
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
        return h.view('manual-ledger-check', { ...new ViewModel(manualLedgerData), showLedgerSplit: true, provisionalValue: 0 }).code(400).takeover()
      }

      const provisionalLedgerData = sessionHandler.get(request, sessionKey)

      if (provisionalLedgerData?.provisionalLedgerData) {
        await saveCalculatedManualLedger(provisionalLedgerData)
      }

      await updateQualityChecksStatus(paymentRequestId, 'Pending')
      return h.redirect('/quality-check')
    }
  }
}]
