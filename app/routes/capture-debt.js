const util = require('util')

module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      const schemes = ['SFI', 'SFI Pilot', 'Hardcoded Values']
      return h.view('capture-debt', { schemes: schemes }) 
    }
  }
},
{
  method: 'POST',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      const schemes = ['SFI', 'SFI Pilot', 'Hardcoded Values']
      const a = request.payload
      console.log(util.inspect(a, false, 1, true))
      return h.view('capture-debt', { ...a, schemes: schemes, test: "tes" })
    }
  }
}]
