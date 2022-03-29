const { ledger, enrichment } = require('./permissions')
const devAccount = { homeAccountId: 'Developer', name: 'Developer' }

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (redirectCode, cookieAuth) => {
  cookieAuth.set({
    scope: [ledger, enrichment],
    account: devAccount
  })
}

const refresh = async (account, cookieAuth, forceRefresh = true) => {
  cookieAuth.set({
    scope: [ledger, enrichment],
    account: devAccount
  })

  return [ledger, enrichment]
}

const logout = async (account) => { return undefined }

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
