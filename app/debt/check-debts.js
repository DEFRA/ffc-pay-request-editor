const db = require('../data')

const checkDebts = async (schemeId, frn, reference, secondaryReference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return {}
  } else {
    const referenceNumeric = reference.match(/\d+/)[0]
    const secondaryReferenceNumeric = secondaryReference.match(/\d+/)[0]
    return db.debtData.findOne({
      transaction,
      where: {
        schemeId,
        frn: parsedFrn,
        netValue,
        paymentRequestId: null,
        [db.Sequelize.Op.or]: [
          { reference },
          { reference: secondaryReference },
          {
            reference: {
              [db.Sequelize.Op.like]: `%${Number(referenceNumeric).toString()}%`
            }
          },
          {
            reference: {
              [db.Sequelize.Op.like]: `%${Number(secondaryReferenceNumeric).toString()}%`
            }
          }
        ]
      }
    })
  }
}

module.exports = checkDebts
