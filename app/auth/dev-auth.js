const { ledger, enrichment } = require('./permissions')

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (redirectCode, cookieAuth) => {
  cookieAuth.set({
    scope: [ledger, enrichment],
    account: 'Developer'
  })
}

const refresh = async (account, cookieAuth, forceRefresh = true) => {
  cookieAuth.set({
    scope: [ledger, enrichment],
    account: 'Developer'
  })

  return [ledger, enrichment]
}

const logout = (account) => { return undefined }

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
