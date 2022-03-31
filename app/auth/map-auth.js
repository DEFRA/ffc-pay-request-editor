const isInRole = require('./is-in-role')
const { enrichment, ledger } = require('./permissions')

const mapAuth = (request) => {
  return {
    isAuthenticated: request.auth.isAuthenticated,
    isAnonymous: !request.auth.isAuthenticated,
    isEnrichmentUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, enrichment),
    isLedgerUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, ledger)
  }
}

module.exports = mapAuth
