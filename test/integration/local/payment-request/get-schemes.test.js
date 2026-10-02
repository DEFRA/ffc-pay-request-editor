const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { getSchemes } = require('../../../../app/processing/scheme')

describe('Get schemes test', () => {
  let schemes
  const resetData = async () => {
    await truncate(['schemes'])
  }
  beforeEach(async () => {
    await resetData()

    schemes = [{
      schemeId: 1,
      name: 'SFI'
    }, {
      schemeId: 2,
      name: 'A Name'
    }, {
      schemeId: 3,
      name: 'Vet Visits'
    }]

    await db.scheme().insert(schemes)
  })

  afterAll(async () => {
    await resetData()
    await db.close()
  })

  test('return name attribute from scheme db, ordered alphabetically', async () => {
    const result = await getSchemes()
    expect(result[0].name).toBe('A Name')
  })
})
