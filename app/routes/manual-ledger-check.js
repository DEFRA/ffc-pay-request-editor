const Joi = require('joi')
const { getManualLedger, calculateManualLedger, saveCalculatedManualLedger, updateManualLedgerUser } = require('../manual-ledger')
const ViewModel = require('./models/manual-ledger-check')
const { updateQualityChecksStatus } = require('../quality-check')
const { convertToPence } = require('../processing/conversion')
const sessionHandler = require('../session-handler')
const { ledger } = require('../auth/permissions')
const getUser = require('../auth/get-user')
const { PENDING } = require('../quality-check/statuses')
const sessionKey = 'provisionalLedgerData'
const { sendManualLedgerCheckEvent } = require('../event')

module.exports = [{
  method: 'GET',
  path: '/manual-ledger-check',
  options: {
    auth: { scope: [ledger] },
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
    auth: { scope: [ledger] },
    validate: {
      query: Joi.object({
        paymentRequestId: Joi.number().required(),
        'ar-value': Joi.number().required(),
        'ap-value': Joi.number().required(),
        'ap-percentage': Joi.number().required(),
        'ar-percentage': Joi.number().required()
      }).options({ allowUnknown: true }),
      failAction: async (request, h, error) => {
        const paymentRequestId = request.query.paymentRequestId

        if (!paymentRequestId) {
          return h.view('404').code(400).takeover()
        }

        const manualLedgerData = await getManualLedger(paymentRequestId)
        return h.view('manual-ledger-check', new ViewModel(manualLedgerData, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      sessionHandler.clear(request, sessionKey)
      const paymentRequestId = request.query.paymentRequestId
      const arValue = convertToPence(request.query['ar-value'])
      const apValue = convertToPence(request.query['ap-value'])
      const manualLedgerData = await calculateManualLedger(paymentRequestId, arValue, apValue)

      if (Object.keys(manualLedgerData).length) {
        sessionHandler.set(request, sessionKey, { paymentRequestId, provisionalLedgerData: manualLedgerData.manualLedgerChecks })
        return h.view('manual-ledger-check', { ...new ViewModel(manualLedgerData) })
      }

      return h.view('500').code(500).takeover()
    }
  }
},
{
  method: 'POST',
  path: '/manual-ledger-check',
  options: {
    auth: { scope: [ledger] },
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
        sessionHandler.clear(request, sessionKey)
      }

      const user = getUser(request)
      await updateManualLedgerUser(paymentRequestId, user)
      await updateQualityChecksStatus(paymentRequestId, PENDING)
      await sendManualLedgerCheckEvent(paymentRequestId, user, provisionalLedgerData)
      return h.redirect('/quality-check')
    }
  }
}]
