const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/static'),
  require('../routes/home'),
  require('../routes/capture-debt'),
  require('../routes/capture'),
  require('../routes/enrich'),
  require('../routes/enrich-request'),
  require('../routes/review'),
  require('../routes/quality-check'),
  require('../routes/manual-ledger'),
  require('../routes/manual-ledger-check'),
  require('../routes/manual-ledger-review'),
  require('../routes/authenticate'),
  require('../routes/login'),
  require('../routes/logout'),
  require('../routes/dev-auth')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
