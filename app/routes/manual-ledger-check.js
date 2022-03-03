module.exports = {
  method: 'GET',
  path: '/manual-ledger-check',
  handler: async (request, h) => {
    return h.view('manual-ledger-check')
  }
}
