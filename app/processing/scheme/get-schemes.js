const { scheme } = require('../../database')

const getSchemes = async () => {
  const schemes = await scheme().select('name')
  return schemes.sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = { getSchemes }
