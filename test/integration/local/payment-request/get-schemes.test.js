const db = require('../../../../app/data')
const { getSchemes } = require('../../../../app/processing/scheme')

describe('Get schemes test', () => {
  let schemes
  const resetData = async () => {
    await db.scheme.truncate({ cascade: true })
  }
  beforeEach(async () => {
    await resetData()

    schemes = [{
      schemeId: 1,
      name: 'SFI',
      plain: false
    }, {
      schemeId: 2,
      name: 'A Name',
      plain: false
    }]

    await db.scheme.bulkCreate(schemes)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('return name attribute from scheme db', async () => {
    const result = await getSchemes()
    expect(result[1].name).toBe('A Name')
  })

  test('change name attribute to SFI22 if name is SFI', async () => {
    const result = await getSchemes()
    expect(result[0].name).toBe('SFI22')
  })

  test('Return null where no name attribute', async () => {
    await resetData()
    schemes[1].name = null
    await db.scheme.bulkCreate(schemes)
    const result = await getSchemes()
    expect(result[1].name).toBe(null)
  })
})
