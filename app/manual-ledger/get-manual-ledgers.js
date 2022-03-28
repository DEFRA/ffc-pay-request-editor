const db = require('../data')

const getManualLedgers = async (statuses) => {
  return db.paymentRequest.findAll(
    {
      include: [
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        },
        {
          model: db.qualityCheck,
          as: 'qualityChecks',
          where: { status: statuses }
        }
      ],
      where: { categoryId: 2 }
    }
  )
}
module.exports = getManualLedgers
