const db = require('../data')
const { LEDGER_CHECK, LEDGER_ENRICHMENT } = require('../payment-request/categories')
const { PENDING } = require('../quality-check/statuses')
const schema = require('./schemas/capture-debt')
const ViewModel = require('./models/capture-debt')
const dateSchema = require('./schemas/date')
const { getSchemeId, getSchemes } = require('../processing/scheme')
const { convertToPence, convertDateToDDMMYYYY } = require('../processing/conversion')
const { saveDebtData } = require('../processing/debt')
const {
  getPaymentRequestAwaitingEnrichmentWithValue,
  getPaymentRequestAwaitingEnrichmentWithNetValue
} = require('../payment-request/get-payment-request')
const { enrichment } = require('../auth/permissions')
const { getUser } = require('../auth')
const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')
const format = require('../utils/date-formatter')

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    auth: { scope: [enrichment] },
    handler: async (_request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      return h.view('capture-debt', new ViewModel(schemes))
    }
  }
},
{
  method: 'POST',
  path: '/capture-debt',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view('capture-debt', new ViewModel(schemes, request.payload, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { scheme, frn, applicationIdentifier, net, debtType } = request.payload
      const day = format(request.payload['debt-discovered-day'])
      const month = format(request.payload['debt-discovered-month'])
      const year = request.payload['debt-discovered-year']

      const validDate = dateSchema({ date: `${year}-${month}-${day}` })

      if (validDate.error) {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view('capture-debt', new ViewModel(schemes, request.payload, validDate.error)).code(400).takeover()
      }

      const netValue = convertToPence(String(net))
      const schemeId = await getSchemeId(scheme)
      const recoveryDate = convertDateToDDMMYYYY(...['debt-discovered-day', 'debt-discovered-month', 'debt-discovered-year'].map(key => request.payload[key]))
      const { userId, username } = getUser(request)

      const transaction = await db.sequelize.transaction()
      try {
        const debtData = {
          paymentRequestId: undefined,
          schemeId,
          frn,
          reference: applicationIdentifier,
          netValue,
          debtType,
          recoveryDate,
          attachedDate: undefined,
          createdDate: new Date(),
          createdBy: username,
          createdById: userId
        }

        let matchingPaymentRequest = await getPaymentRequestAwaitingEnrichmentWithValue(schemeId, frn, applicationIdentifier, netValue)
        matchingPaymentRequest ??= await getPaymentRequestAwaitingEnrichmentWithNetValue(schemeId, frn, applicationIdentifier, netValue)

        if (matchingPaymentRequest) {
          debtData.paymentRequestId = matchingPaymentRequest.paymentRequestId

          if (matchingPaymentRequest.categoryId === LEDGER_ENRICHMENT) {
            const paymentRequestId = matchingPaymentRequest.paymentRequestId
            await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
            await updateQualityChecksStatus(paymentRequestId, PENDING)
          }
        }

        await saveDebtData(debtData, transaction)
        await transaction.commit()
      } catch (error) {
        await transaction.rollback()
        throw (error)
      }

      return h.redirect('/')
    }
  }
}]
