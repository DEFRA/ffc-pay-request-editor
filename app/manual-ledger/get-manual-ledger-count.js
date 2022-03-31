const db = require('../data')
const { FAILED, NOT_READY } = require('../quality-check/statuses')

const getManualLedgerCount = async () => {
  return db.paymentRequest.count(
    {
      include: [
        {
          model: db.qualityCheck,
          as: 'qualityChecks',
          where: { status: [NOT_READY, FAILED] }
        }
      ],
      where: { categoryId: 2 }
    }
  )
}

module.exports = getManualLedgerCount
