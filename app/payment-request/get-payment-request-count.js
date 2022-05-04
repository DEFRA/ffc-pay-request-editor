const db = require('../data')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')

const getPaymentRequestCount = async (categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
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
