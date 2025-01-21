const Joi = require('joi')
const { ledger } = require('../auth/permissions')
const { getManualLedger } = require('../manual-ledger')
const ViewModel = require('./models/manual-ledger-review')
const { getUser } = require('../auth')
const { ledgerReview } = require('../manual-ledger/ledger-review')
const statusCodes = require('../constants/status-codes')

const qcView = '/quality-check'

module.exports = [{
  method: 'GET',
  path: '/manual-ledger-review',
  options: {
    auth: { scope: [ledger] },
    handler: async (request, h) => {
      const paymentRequestId = parseInt(request.query.paymentrequestid)

      if (!paymentRequestId) {
        return h.redirect(qcView)
      }

      const manualLedgerData = await getManualLedger(paymentRequestId)
      const { userId } = getUser(request)
      if (manualLedgerData && manualLedgerData.manualLedgerChecks[0].createdById !== userId) {
        return h.view('manual-ledger-review', new ViewModel(manualLedgerData))
      }

      return h.redirect(qcView)
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
        return h.view('manual-ledger-review', new ViewModel(manualLedgerData, error)).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      await ledgerReview(request)

      return h.redirect(qcView).code(statusCodes.MOVED_PERMANENTLY)
    }
  }
}]
