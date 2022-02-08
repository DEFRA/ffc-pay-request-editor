const schema = require('./schemas/capture-debt')
const ViewModel = require('../models/capture-debt')

const getSchemes = require('../processing/get-schemes')
const getSchemeId = require('../processing/get-scheme-id')
const getPaymentRequestId = require('../processing/get-payment-request-id')

const { convertToPounds, convertStringToPence } = require('../processing/convert-currency')

const saveDebtData = require('../processing/save-debt-data')

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
        error.output.payload.message = error.details.map(detail => { return `${detail.message}\n` }).join('')
        return h.view('capture-debt', new ViewModel(schemes, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { scheme, frn, applicationIdentifier, net, debtType } = request.payload

      const netValue = convertToPounds(convertStringToPence(net))

      const schemeId = await getSchemeId(scheme)

      const [debtDay, debtMonth, debtYear] = ['debt-discovered-day', 'debt-discovered-month', 'debt-discovered-year'].map(key => request.payload[key])

      const recoveryDate = `${debtDay}-${debtMonth}-${debtYear}`

      // check frn and appId

      // if error, then wrong frn
      const paymentRequestId = getPaymentRequestId(frn, schemeId)

      console.log(`payId: ${paymentRequestId} frn: ${frn} schemeId ${schemeId} appID: ${applicationIdentifier} type: ${debtType} debt day: ${debtDay} debt month: ${debtMonth} debt yr: ${debtYear} || ${debtDate} net: ${netValue}`)

      const debtData = {
        paymentRequestId,
        schemeId,
        frn,
        reference: applicationIdentifier,
        netValue,
        debtType,
        recoveryDate,
        attachedDate: undefined,
        createdDate: new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''),
        createdBy: undefined
      }

      saveDebtData({ debtData })

      return h.redirect('capture-debt')
    }
  }
}]
