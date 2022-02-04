module.exports = {
  method: 'GET',
  path: '/capture-debt',
  options: {
    handler: async (request, h) => {
      return h.view('capture-debt')
    }
  }
}
