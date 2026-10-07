const { getSchemes } = require('ffc-pay-schemes')
const { scheme } = require('./database')

const updateSchemesDatabase = async () => {
  console.log('Checking for updates to supported schemes')
  const schemes = getSchemes()

  for (const { schemeId, schemeName } of schemes) {
    const existingScheme = (await scheme().where({ schemeId }).first()) ?? null

    await scheme().insert({ schemeId, name: schemeName }).onConflict('schemeId').merge()

    const created = !existingScheme
    console.log(`${schemeName} ${created ? 'created' : 'updated'}`)
  }
}

module.exports = {
  updateSchemesDatabase
}
