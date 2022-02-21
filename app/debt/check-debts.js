const db = require('../data')

const checkDebts = async (frn, reference, netValue, transaction) => {
  return db.debtData.findAll({
    transaction,
    lock: true,
    where: {
      frn: parseInt(frn),
      reference: reference,
      netValue: parseFloat(netValue)
    }
  })
}

module.exports = checkDebts
