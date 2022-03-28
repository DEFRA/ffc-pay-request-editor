const db = require('../../../../app/data')
const { getSchemes } = require('../../../../app/processing/scheme')

describe('Get schemes test', () => {
  let scheme
  const resetData = async () => {
    await db.scheme.truncate({ cascade: true })
  }
  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: 1,
      name: 'A Name',
      plain: false
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('return name attribute from scheme db', async () => {
    const result = await getSchemes()
    console.log(result)
    expect(result[0].name).toBe('A Name')
  })

  test('Return null where no name attribute', async () => {
    await resetData()
    scheme.name = null
    await db.scheme.create(scheme)
    const result = await getSchemes()
    console.log(result)
    expect(result[0].name).toBe(null)
  })
})
