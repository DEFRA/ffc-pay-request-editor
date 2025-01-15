const schema = require('./schemas/capture-debt')
const ViewModel = require('./models/capture-debt')
const dateSchema = require('./schemas/date')
const { getSchemes } = require('../processing/scheme')
const { captureDebtData } = require('../processing/debt')
const { enrichment } = require('../auth/permissions')
const format = require('../utils/date-formatter')
const statusCodes = require('../constants/status-codes')

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
        return h.view('capture-debt', new ViewModel(schemes, request.payload, error)).code(statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      if (request.payload.scheme === 'SFI22') {
        request.payload.scheme = 'SFI'
      }
      const day = format(request.payload['debt-discovered-day'])
      const month = format(request.payload['debt-discovered-month'])
      const year = request.payload['debt-discovered-year']
      const validDate = dateSchema({ date: `${year}-${month}-${day}` })

      if (validDate.error) {
        const schemes = (await getSchemes()).map(x => x.name)
        return h.view('capture-debt', new ViewModel(schemes, request.payload, validDate.error)).code(statusCodes.BAD_REQUEST).takeover()
      }

      await captureDebtData(request)
      return h.redirect('/')
    }
  }
}]
