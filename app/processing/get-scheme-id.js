const db = require('../data')

const getSchemeId = async (name, transaction) => {
  const scheme = await db.scheme.findOne({ where: { name }, transaction })
  return scheme?.schemeId
}

module.exports = getSchemeId
