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
          as: 'qualityCheck',
          attributes: ['status']
        }
      ],
      where: { categoryId: 2, status: 'Not ready' }
    }
  )
}
module.exports = getManualLedgers
