const db = require('../data')

const getManualLedgers = async (paymentRequestId) => {
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
          where: { status: 'Not ready' }
        }
      ],
      where: { categoryId: 2 }
    }
  )
}
module.exports = getManualLedgers
