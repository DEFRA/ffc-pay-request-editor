const db = require('../../data')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })
  for (const scheme of schemes) {
    if (scheme.name === 'SFI') {
      scheme.name = 'SFI22'
    }
    if (scheme.name === 'Vet Visits') {
      scheme.name = 'Annual Health and Welfare Review'
    }
  }
  return schemes.map(x => x.get({ plain: true })).sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = { getSchemes }
