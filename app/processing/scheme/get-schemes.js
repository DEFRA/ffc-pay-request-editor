const db = require('../../data')
const { replaceSFI22 } = require('../replace-sfi22')

const getSchemes = async () => {
  const schemes = await db.scheme.findAll({ attributes: ['name'] })
  const modifiedSchemes = replaceSFI22(schemes)
  return modifiedSchemes.map(x => x.get({ plain: true }))
}

module.exports = { getSchemes }
