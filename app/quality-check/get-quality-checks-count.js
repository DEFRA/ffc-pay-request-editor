const db = require('../data')

const getQualityChecksCount = async () => {
  return db.qualityCheck.count(
    {
      include: [
        {
          model: db.paymentRequest,
          as: 'paymentRequest',
          where: {
            categoryId: 2
          }
        }
      ],
      where: { status: 'Pending' }
    })
}

module.exports = getQualityChecksCount
