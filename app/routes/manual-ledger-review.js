const Joi = require('joi')
const { ledger } = require('../auth/permissions')
const { getManualLedger, resetManualLedger } = require('../manual-ledger')
const { updateQualityChecksStatus } = require('../quality-check')
const ViewModel = require('./models/manual-ledger-review')

module.exports = [{
  method: 'GET',
  path: '/manual-ledger-review',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const paymentRequestId = parseInt(request.query.paymentrequestid)

      if (!paymentRequestId) {
        return h.redirect('/quality-check')
      }

      const manualLedgerData = await getManualLedger(paymentRequestId)

      if (manualLedgerData) {
        return h.view('manual-ledger-review', new ViewModel(manualLedgerData))
      }

      return h.redirect('/quality-check')
    }
  }
},
{
  method: 'POST',
  path: '/manual-ledger-review',
  options: {
    auth: { scope: [ledger] },
    validate: {
      payload: Joi.object({
        paymentRequestId: Joi.string().required(),
        status: Joi.string().required()
        // status: Joi.boolean().required()
      }),
      failAction: async (request, h, error) => {
        const { paymentRequestId } = request.payload
        const manualLedgerData = await getManualLedger(paymentRequestId)
        return h.view('manual-ledger-review', new ViewModel(manualLedgerData, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const status = request.payload.status ? request.payload.status : 'Pending'
      const paymentRequestId = request.payload.paymentRequestId
      if (paymentRequestId) {
        await updateQualityChecksStatus(paymentRequestId, status)
        if (status === 'Failed') {
          await resetManualLedger(paymentRequestId)
        }
      }
      return h.redirect('/quality-check').code(301)
    }
  }
}]
