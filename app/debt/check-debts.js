const db = require('../data')
const { convertToPounds } = require('../processing/conversion')

const checkDebts = async (frn, reference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return {}
  } else {
    const convertNetValue = convertToPounds(netValue)
    return db.debtData.findOne({
      transaction,
      where: {
        frn: parsedFrn,
        reference,
        netValue: convertNetValue,
        paymentRequestId: null
      }
    })
  }
}

module.exports = checkDebts
