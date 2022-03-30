const getUser = (request) => {
  return {
    userId: request ? request.auth.credentials.account.homeAccountId : 'Automated',
    username: request ? request.auth.credentials.account.name : 'Automated'
  }
}

module.exports = getUser
