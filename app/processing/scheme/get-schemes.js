const db = require('../../data')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })
  return schemes.map(x => x.get({ plain: true })).sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = { getSchemes }
