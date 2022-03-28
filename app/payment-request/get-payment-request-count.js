const db = require('../data')

const getPaymentRequestCount = async (categoryId = 1) => {
  return db.paymentRequest.count({
    include: [{
      model: db.debtData,
      as: 'debtData'
    }],
    where: {
      $debtData$: null,
      categoryId
    }
  })
}

module.exports = getPaymentRequestCount
