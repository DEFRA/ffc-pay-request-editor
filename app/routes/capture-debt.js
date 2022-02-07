const getSchemes = require('../processing/get-schemes')
const schema = require('./schemas/capture-debt')
const ViewModel = require('../models/capture-debt')

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
      const schemes = (await getSchemes()).map(x => x.name)
      return h.view('capture-debt', new ViewModel(schemes))
    }
  }
}]
