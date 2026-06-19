const schema = require('./schemas/capture-debt')
const ViewModel = require('./models/capture-debt')
const dateSchema = require('./schemas/date')
const { getSchemes } = require('../processing/scheme')
const { captureDebtData } = require('../processing/debt')
const { enrichment } = require('../auth/permissions')
const format = require('../utils/date-formatter')
const statusCodes = require('../constants/status-codes')

const view = 'capture-debt'

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      const payload = {
        scheme: request.query?.scheme,
        frn: request.query?.frn,
        applicationIdentifier: request.query?.applicationIdentifier,
        net: request.query?.net,
        debtType: request.query?.debtType,
        'debt-discovered-day': request.query?.['debt-discovered-day'],
        'debt-discovered-month': request.query?.['debt-discovered-month'],
        'debt-discovered-year': request.query?.['debt-discovered-year']
      }

      return h.view(view, new ViewModel(schemes, payload))
    }
  }
},
{
  method: 'POST',
  path: '/capture-debt-confirm',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: schema(),
      failAction: async (request, h, error) => {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view(view, new ViewModel(schemes, request.payload, error)).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const day = format(request.payload['debt-discovered-day'])
      const month = format(request.payload['debt-discovered-month'])
      const year = request.payload['debt-discovered-year']
      const validDate = dateSchema({ date: `${year}-${month}-${day}` })

      if (validDate.error) {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view(view, new ViewModel(schemes, request.payload, validDate.error)).code(statusCodes.BAD_REQUEST).takeover()
      }

      return h.view(view + '-confirm', {
        scheme: request.payload.scheme,
        frn: request.payload.frn,
        applicationIdentifier: request.payload.applicationIdentifier,
        net: request.payload.net,
        debtType: request.payload.debtType,
        debtDiscoveredDay: day,
        debtDiscoveredMonth: month,
        debtDiscoveredYear: year
      })
    }
  }
},
{
  method: 'POST',
  path: '/capture-debt',
  options: {
    auth: { scope: [enrichment] },
    validate: {
      payload: schema(),
      failAction: async (request, h, error) => {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view(view, new ViewModel(schemes, request.payload, error)).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      if (request.payload.scheme === 'SFI22') {
        request.payload.scheme = 'SFI'
      }
      if (request.payload.scheme === 'Annual Health and Welfare Review') {
        request.payload.scheme = 'Vet Visits'
      }
      const day = format(request.payload['debt-discovered-day'])
      const month = format(request.payload['debt-discovered-month'])
      const year = request.payload['debt-discovered-year']
      const validDate = dateSchema({ date: `${year}-${month}-${day}` })

      if (validDate.error) {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view(view, new ViewModel(schemes, request.payload, validDate.error)).code(statusCodes.BAD_REQUEST).takeover()
      }

      await captureDebtData(request)
      return h.redirect('/capture?debtAdded=true')
    }
  }
}]
