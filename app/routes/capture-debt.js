const db = require('../data')

const schema = require('./schemas/capture-debt')
const ViewModel = require('../models/capture-debt')

const { getSchemeId, getSchemes } = require('../processing/scheme')
const { convertToPounds, convertToPence, convertDateToDDMMYYYY } = require('../processing/conversion')
const { saveDebtData } = require('../processing/debt')
const { getPaymentRequestAwaitingEnrichment } = require('../payment-request/get-payment-request')

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      return h.view('capture-debt', new ViewModel(schemes))
    }
  }
},
{
  method: 'POST',
  path: '/capture-debt',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view('capture-debt', new ViewModel(schemes, request.payload, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { scheme, frn, applicationIdentifier, net, debtType } = request.payload
      const netValue = convertToPounds(convertToPence(String(net)))
      const schemeId = await getSchemeId(scheme)
      const recoveryDate = convertDateToDDMMYYYY(...['debt-discovered-day', 'debt-discovered-month', 'debt-discovered-year'].map(key => request.payload[key]))

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
          createdBy: undefined
        }

        const matchingPaymentRequest = await getPaymentRequestAwaitingEnrichment(schemeId, frn, applicationIdentifier, convertToPence(String(net)))
        if (matchingPaymentRequest) {
          debtData.paymentRequestId = matchingPaymentRequest.paymentRequestId
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
