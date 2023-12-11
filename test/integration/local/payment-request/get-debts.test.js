const { getDebts, getDebtsCount } = require('../../../../app/debt')
const db = require('../../../../app/data')
const { SFI } = require('../../../../app/constants/schemes')

let scheme

const resetData = async () => {
  await db.scheme.truncate({ cascade: true })
  await db.debtData.truncate({ cascade: true })
}

describe('Get debts test', () => {
  const debts = {
    frn: 1234567890,
    reference: 'SIP00000000000001',
    netValue: 15000,
    schemeId: SFI
  }

  beforeEach(async () => {
    await resetData()

    scheme = {
      schemeId: SFI,
      name: 'SFI'
    }

    await db.scheme.create(scheme)
    await db.debtData.create(debts)
  })

  afterAll(async () => {
    await resetData()
    await db.sequelize.close()
  })

  test('should return 1 debt record', async () => {
    const debt = await getDebts()
    expect(debt).toHaveLength(1)
  })

  test('should return count of 1 for debt', async () => {
    const debtCount = await getDebtsCount()
    expect(debtCount).toEqual(1)
  })

  test('should return zero debt records', async () => {
    await db.debtData.truncate({ cascade: true })
    const debt = await getDebts()
    expect(debt).toHaveLength(0)
  })

  test('should return count of zero for debt', async () => {
    await db.debtData.truncate({ cascade: true })
    const debtCount = await getDebtsCount()
    expect(debtCount).toEqual(0)
  })

  test('records should be in descending order by createdDate', async () => {
    await db.debtData.truncate({ cascade: true })
    const debtData = [{
      frn: 1234567891,
      reference: 'SIP00000000000001',
      netValue: 15000,
      createdDate: '2022-01-01'
    },
    {
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 15000,
      createdDate: '2022-02-01'
    }]
    await db.debtData.bulkCreate(debtData)
    const debtDataRows = await getDebts()
    expect(debtDataRows[1].createdDate).toStrictEqual(new Date('2022-01-01T00:00:00.000Z'))
    expect(debtDataRows[0].createdDate).toStrictEqual(new Date('2022-02-01T00:00:00.000Z'))
  })

  test('if data with scheme SFI, name should be replaced with SFI22', async () => {
    const debt = await getDebts()
    expect(debt[0].schemes.name).toBe('SFI22')
  })
})
