const db = require('../data')

const checkDebts = async (schemeId, frn, reference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return {}
  } else {
    const referenceNumeric = reference.match(/\d+/)[0]

    return db.debtData.findOne({
      transaction,
      where: {
        schemeId,
        frn: parsedFrn,
        netValue,
        paymentRequestId: null,
        reference: {
          [db.Sequelize.Op.like]: `%${referenceNumeric}`
        }
      }
    })
  }
}

module.exports = checkDebts
