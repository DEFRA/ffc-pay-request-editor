const db = require('../data')

const getManualLedgers = async (paymentRequestId) => {
  return db.paymentRequest.findAll(
    {
      include: [
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        }
      ],
      where: { categoryId: 2 }
    }
  )
}
module.exports = getManualLedgers
