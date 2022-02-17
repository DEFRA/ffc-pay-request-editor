const { getQualityChecks, getQualityChecksCount } = require('../../../../app/quality-check')
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

  test('should return 1 quality check record', async () => {
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(1)
  })

  test('should return count of 1 for quality check', async () => {
    const qualityCheckCount = await getQualityChecksCount()
    expect(qualityCheckCount).toEqual(1)
  })

  test('should return zero quality check records', async () => {
    await db.sequelize.truncate({ cascade: true })
    const qualityChecks = await getQualityChecks()
    expect(qualityChecks).toHaveLength(0)
  })

  test('should return count of 0 for quality check', async () => {
    await db.sequelize.truncate({ cascade: true })
    const qualityCheckCount = await getQualityChecksCount()
    expect(qualityCheckCount).toEqual(0)
  })
})
