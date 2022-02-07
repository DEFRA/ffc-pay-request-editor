const util = require('util')
const getSchemes = require('../processing/get-schemes')
const schema = require('./schemas/capture-debt')
const frnSchema = require('./schemas/frn')
const ViewModel = require('../models/capture-debt')

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      // console.log(util.inspect(frnSchema, false, 1, true))
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
        const a = request.payload
        console.log(util.inspect(a, false, 1, true))
        console.log('this 1', error.code, error.message)
        return h.view('capture-debt', new ViewModel(schemes, error)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      const a = request.payload
      console.log(util.inspect(a, false, 1, true))
      return h.view('capture-debt', new ViewModel(schemes))
    }
  }
}]
