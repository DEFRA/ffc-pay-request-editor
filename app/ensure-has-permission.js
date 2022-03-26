const auth = require('./auth')

const ensureHasPermission = async (request, h, requiredPermissions, requireAll = false) => {
  const permissions = await auth.refresh(request.auth.credentials.account, request.cookieAuth)

  if (!hasPermission(requiredPermissions, permissions, requireAll)) {
    return h.redirect('/').code(401).takeover()
  }
}

const hasPermission = (requiredPermissions, permissions, requireAll) => {
  const userPermissions = Object.keys(permissions)
  console.log(userPermissions)
  console.log(requiredPermissions)
  if (!requireAll) {
    return requiredPermissions.some(x => userPermissions.includes(x))
  }

  return requiredPermissions.all(x => userPermissions.includes(x))
}

module.exports = ensureHasPermission
