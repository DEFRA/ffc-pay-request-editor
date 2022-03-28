const db = require('../data')

const getManualLedgerCount = async () => {
  return db.paymentRequest.count(
    {
      include: [
        {
          model: db.qualityCheck,
          as: 'qualityChecks',
          where: { status: ['Not ready', 'Failed'] }
        }
      ],
      where: { categoryId: 2 }
    }
  )
}

module.exports = getManualLedgerCount
