const { deleteDebt } = require('../../../../app/debt')
const db = require('../../../../app/data')

describe('Delete debts test', () => {
  beforeEach(async () => {
    await db.debtData.truncate({ cascade: true })
    await db.debtData.create({
      debtDataId: 1,
      frn: 1234567890,
      reference: 'SIP00000000000001',
      netValue: 15000
    })
  })

  afterAll(async () => {
    await db.debtData.truncate({ cascade: true })
    await db.paymentRequest.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should delete debt', async () => {
    await deleteDebt(1)
    const remainingDebt = await db.debtData.findAll({ raw: true })
    expect(remainingDebt.length).toBe(0)
  })

  test('should not delete attached debt', async () => {
    await db.paymentRequest.create({ paymentRequestId: 1 })
    await db.debtData.update({ paymentRequestId: 1 }, { where: { debtDataId: 1 } })
    await deleteDebt(1)
    const remainingDebt = await db.debtData.findAll()
    expect(remainingDebt.length).toBe(1)
  })
})
