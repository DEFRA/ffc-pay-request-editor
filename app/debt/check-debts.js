const db = require('../data')
const { convertToPounds } = require('../processing/conversion/convert-currency')

const checkDebts = async (frn, reference, netValue, transaction) => {
  const convertNetValue = convertToPounds(netValue)
  return db.debtData.findOne({
    transaction,
    where: {
      frn: parseInt(frn),
      reference: reference,
      netValue: parseFloat(convertNetValue)
    }
  })
}

module.exports = checkDebts
