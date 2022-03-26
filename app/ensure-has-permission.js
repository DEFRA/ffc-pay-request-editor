const auth = require('./auth')

const ensureHasPermission = async (request, h, requiredPermissions, requireAll = false) => {
  const permissions = await auth.refresh(request.auth.credentials.account, request.cookieAuth)

  if (!hasPermission(requiredPermissions, permissions, requireAll)) {
    return h.redirect('/').code(401).takeover()
  }
}

const hasPermission = (requiredPermissions, permissions, requireAll) => {
  if (!requireAll) {
    return requiredPermissions.some(x => permissions[x])
  }
  return requiredPermissions.all(x => permissions[x])
}

module.exports = ensureHasPermission
