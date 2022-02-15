const { getQualityChecks } = require('../../../../app/quality-check')
const db = require('../../../../app/data')

describe('Get quality checks test', () => {
  let qualityCheck

  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    qualityCheck = {
      checkedDate: '2021-08-15',
      checkedBy: 'Mr T',
      status: 'Pending'
    }

    await db.qualityCheck.create(qualityCheck)
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should return quality check', async () => {
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(1)
  })

  test('should return no quality check', async () => {
    await db.sequelize.truncate({ cascade: true })
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(0)
  })
})
