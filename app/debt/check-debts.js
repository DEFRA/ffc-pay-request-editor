const db = require('../data')
const { convertToPounds } = require('../currency-convert')

const checkDebts = async (frn, reference, netValue, transaction) => {
  const convertNetValue = convertToPounds(netValue)
  return db.debtData.findOne({
    transaction,
    where: {
      frn: parseInt(frn),
      reference,
      netValue: convertNetValue
    }
  })
}

module.exports = checkDebts
