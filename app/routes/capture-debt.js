module.exports = [{
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      return h.view('capture-debt')
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
