module.exports = {
  method: 'GET',
  path: '/',
  options: {
    handler: async (request, h) => {
      return h.view('home')
    }
  }
}
