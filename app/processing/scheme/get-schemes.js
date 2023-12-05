const db = require('../../data')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })
  for (let i = 0; i < schemes.length; i++) {
    if (schemes[i].name === 'SFI') {
      schemes[i].name = 'SFI22'
    }
  }
  return schemes.map(x => x.get({ plain: true }))
}

module.exports = { getSchemes }
