const { ledger, enrichment } = require('./permissions')
const { randomUUID } = require('node:crypto')
const devAccount = require('./dev-account')

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

const logout = async (account) => {
  devAccount.homeAccountId = randomUUID()
}

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
