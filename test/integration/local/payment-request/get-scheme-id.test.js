const db = require('../../../../app/data')
const { getSchemeId } = require('../../../../app/processing/scheme')

describe('Get scheme id test', () => {
  let scheme
  const resetData = async () => {
    await db.scheme.truncate({ cascade: true })
  }
  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: 1,
      name: 'somename'
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('Return schemeId where name matches', async () => {
    const foundSchemeId = await getSchemeId(scheme.name)
    expect(foundSchemeId).toBe(1)
  })

  test('Return undefined where name does not match', async () => {
    const foundSchemeId = await getSchemeId('123')
    expect(foundSchemeId).toBe(undefined)
  })
})
