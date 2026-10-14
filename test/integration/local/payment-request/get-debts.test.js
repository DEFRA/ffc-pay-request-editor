const { getSchemeIds, getSchemeNames } = require('ffc-pay-schemes')
const { getDebts, getDebtsCount } = require('../../../../app/debt')
const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')

const { SFI } = getSchemeIds()
const { SFI: SFI_NAME } = getSchemeNames()

let scheme

const resetData = async () => {
  await truncate(['schemes'])
  await truncate(['debtData'])
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
      name: SFI_NAME
    }

    await db.scheme().insert(scheme)
    await db.debtData().insert(debts)
  })

  afterAll(async () => {
    await resetData()
    await db.close()
  })

  test('should return 1 debt record', async () => {
    const debt = await getDebts()

    expect(debt.rows).toHaveLength(1)
    expect(debt.count).toBe(1)
  })

  test('should return count of 1 for debt', async () => {
    const debtCount = await getDebtsCount()

    expect(debtCount).toEqual(1)
  })

  test('should return zero debt records', async () => {
    await truncate(['debtData'])

    const debt = await getDebts()

    expect(debt.rows).toHaveLength(0)
    expect(debt.count).toBe(0)
  })

  test('should return count of zero for debt', async () => {
    await truncate(['debtData'])

    const debtCount = await getDebtsCount()

    expect(debtCount).toEqual(0)
  })

  test('records should be in descending order by createdDate', async () => {
    await truncate(['debtData'])

    const debtData = [
      {
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
      }
    ]

    await db.debtData().insert(debtData)

    const debtDataRows = await getDebts()

    expect(debtDataRows.rows[1].createdDate)
      .toStrictEqual(new Date('2022-01-01T00:00:00.000Z'))

    expect(debtDataRows.rows[0].createdDate)
      .toStrictEqual(new Date('2022-02-01T00:00:00.000Z'))
  })

  test('should return paginated results correctly', async () => {
    await truncate(['debtData'])

    await db.debtData().insert([
      {
        frn: 1234567890,
        reference: 'REF1',
        netValue: 100,
        schemeId: SFI,
        createdDate: '2022-03-01'
      },
      {
        frn: 1234567891,
        reference: 'REF2',
        netValue: 200,
        schemeId: SFI,
        createdDate: '2022-02-01'
      }
    ])

    const page1 = await getDebts({
      page: 1,
      pageSize: 1,
      usePagination: true
    })

    const page2 = await getDebts({
      page: 2,
      pageSize: 1,
      usePagination: true
    })

    expect(page1.rows).toHaveLength(1)
    expect(page2.rows).toHaveLength(1)

    expect(page1.count).toBe(2)
    expect(page2.count).toBe(2)
  })

  test('should return all results when usePagination is false', async () => {
    await db.debtData().insert([
      {
        frn: 1234567891,
        reference: 'REF1',
        netValue: 100,
        schemeId: SFI
      }
    ])

    const result = await getDebts({
      usePagination: false
    })

    expect(result.rows.length).toBeGreaterThan(1)
    expect(result.count).toBe(result.rows.length)
  })

  test('should filter by frn', async () => {
    const result = await getDebts({
      frn: '1234567890'
    })

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].frn.toString()).toBe('1234567890')
    expect(result.count).toBe(1)
  })

  test('should return no records for unknown frn', async () => {
    const result = await getDebts({
      frn: '9999999999'
    })

    expect(result.rows).toHaveLength(0)
    expect(result.count).toBe(0)
  })

  test('should return debts when includeAttached is true', async () => {
    const result = await getDebts({
      includeAttached: true
    })

    expect(result.rows).toHaveLength(1)
    expect(result.count).toBe(1)
  })
})
