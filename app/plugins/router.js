const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/static'),
  require('../routes/home'),
  require('../routes/capture'),
  require('../routes/enrich'),
  require('../routes/review'),
  require('../routes/quality-check'),
  require('../routes/quality-check-status-update')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
