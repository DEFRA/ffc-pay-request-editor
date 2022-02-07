const util = require('util')
const getSchemes = require('../processing/get-schemes')

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
    handler: async (request, h) => {
      const schemes = (await getSchemes()).map(x => x.name)
      const a = request.payload
      console.log(util.inspect(a, false, 1, true))
      return h.view('capture-debt', { ...a, schemes: schemes, test: 'tes' })
    }
  }
}]
