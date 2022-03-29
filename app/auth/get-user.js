const getUser = (request) => {
  return {
    userId: request ? request.auth.credentials.account.homeAccountId : 'ffc-pay-request-editor',
    username: request ? request.auth.credentials.account.name : 'ffc-pay-request-editor'
  }
}

module.exports = getUser
