const db = require('../data')

const checkDebts = async (frn, reference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return {}
  } else {
    return db.debtData.findOne({
      transaction,
      where: {
        frn: parsedFrn,
        reference,
        netValue,
        paymentRequestId: null
      }
    })
  }
}

module.exports = checkDebts
