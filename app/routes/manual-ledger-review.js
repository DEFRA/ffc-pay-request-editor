const Joi = require('joi')
const { ledger } = require('../auth/permissions')
const { getManualLedger, resetManualLedger, updateManualLedgerWithDebtData } = require('../manual-ledger')
const { updateQualityChecksStatus } = require('../quality-check')
const { PASSED, FAILED, PENDING } = require('../quality-check/statuses')
const ViewModel = require('./models/manual-ledger-review')
const { sendManualLedgerReviewEvent } = require('../event')
const { getUser } = require('../auth')

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
      const { userId } = getUser(request)
      if (manualLedgerData && manualLedgerData.manualLedgerChecks[0].createdById !== userId) {
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
      }),
      failAction: async (request, h, error) => {
        const { paymentRequestId } = request.payload
        const manualLedgerData = await getManualLedger(paymentRequestId)
        return h.view('manual-ledger-review', new ViewModel(manualLedgerData, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const status = request.payload.status ? request.payload.status : PENDING
      const paymentRequestId = request.payload.paymentRequestId

      if (paymentRequestId) {
        const manualLedgerData = await getManualLedger(paymentRequestId)
        const user = getUser(request)

        if (manualLedgerData && manualLedgerData.manualLedgerChecks[0].createdById !== user.userId) {
          switch (status) {
            case PASSED:
              await updateManualLedgerWithDebtData(paymentRequestId, status)
              break
            case FAILED:
              await updateQualityChecksStatus(paymentRequestId, status)
              await resetManualLedger(paymentRequestId)
              break
            default:
              await updateQualityChecksStatus(paymentRequestId, status)
              break
          }
        }
        await sendManualLedgerReviewEvent(paymentRequestId, user, status)
      }

      return h.redirect('/quality-check').code(301)
    }
  }
}]
