const db = require('../data')
const { PENDING } = require('./statuses')

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
      where: { status: PENDING }
    })
}

module.exports = getQualityChecksCount
