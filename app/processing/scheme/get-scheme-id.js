const { scheme } = require('../../database')

const getSchemeId = async (name, transaction) => {
  const found = (await scheme(transaction ?? undefined).where({ name }).first()) ?? null
  return found?.schemeId
}

module.exports = { getSchemeId }
