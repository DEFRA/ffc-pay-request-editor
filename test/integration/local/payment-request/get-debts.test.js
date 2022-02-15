const { getDebts } = require('../../../../app/debt')
const db = require('../../../../app/data')

describe('Get debts test', () => {
  let debts

  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    debts = {
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 15000
    }

    await db.debtData.create(debts)
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should return debt', async () => {
    const debt = await getDebts()
    expect(debt).toHaveLength(1)
  })

  test('should return no debt', async () => {
    await db.sequelize.truncate({ cascade: true })
    const debt = await getDebts()
    expect(debt).toHaveLength(0)
  })
})
