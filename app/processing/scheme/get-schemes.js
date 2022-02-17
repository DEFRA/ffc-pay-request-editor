const db = require('../../data')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })

  return schemes.map(x => x.get({ plain: true }))
}

module.exports = { getSchemes }
