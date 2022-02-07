const util = require('util')
const getSchemes = require('../processing/get-schemes')
const schema = require('./schemas/capture-debt')

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      return h.view('capture-debt', { schemes: schemes })
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
        return h.view('capture-debt', { ...request.payload, error: error }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      const a = request.payload
      console.log(util.inspect(a, false, 1, true))
      return h.view('capture-debt', { ...a, schemes: schemes, test: 'tes' })
    }
  }
}]
