const db = require('../data')

const getPaymentRequestCount = async () => {
  return db.paymentRequest.count({
    include: [{
      model: db.debtData,
      as: 'debtData'
    }],
    where: {
      $debtData$: null
    }
  })
}

module.exports = getPaymentRequestCount
