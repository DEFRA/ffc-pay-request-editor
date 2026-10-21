const { deleteDebt } = require('../../../../app/debt')
const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')

const resetData = async () => {
  await truncate(['debtData'])
  await truncate(['paymentRequests'])
}

describe('Delete debts test', () => {
  beforeEach(async () => {
    await resetData()
    await db.debtData().insert({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 15000
    })
  })

  afterAll(async () => {
    await resetData()
    await db.close()
  })

  test('should delete debt', async () => {
    await deleteDebt(1)
    const remainingDebt = await db.debtData()
    expect(remainingDebt.length).toBe(0)
  })

  test('should not delete attached debt', async () => {
    await db.paymentRequest().insert({ paymentRequestId: 1 })
    await db.debtData().where({ debtDataId: 1 }).update({ paymentRequestId: 1 })
    await deleteDebt(1)
    const remainingDebt = await db.debtData()
    expect(remainingDebt.length).toBe(1)
  })
})
