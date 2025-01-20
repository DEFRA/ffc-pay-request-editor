const db = require('../../data')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })
  for (const scheme of schemes) {
    if (scheme.name === 'SFI') {
      scheme.name = 'SFI22'
    }
  }
  return schemes.map(x => x.get({ plain: true }))
}

module.exports = { getSchemes }
