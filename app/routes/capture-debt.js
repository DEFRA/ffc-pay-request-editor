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
      return h.view('capture-debt', { test: 'value' })
    }
  }
}]
