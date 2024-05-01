const db = require('../data')

const checkDebtsByEnrichment = async (frn, reference, secondaryReference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return null
  } else {
    const referenceNumeric = reference.match(/\d+/)[0]
    const secondaryReferenceNumeric = secondaryReference.match(/\d+/)[0]
    return db.debtData.findOne({
      transaction,
      where: {
        frn: parsedFrn,
        netValue,
        debtType: {
          [db.Sequelize.Op.not]: null
        },
        recoveryDate: {
          [db.Sequelize.Op.not]: null
        },
        [db.Sequelize.Op.or]: [
          { reference },
          { reference: secondaryReference },
          {
            reference: {
              [db.Sequelize.Op.like]: `%${Number(referenceNumeric).toString()}`
            }
          },
          {
            reference: {
              [db.Sequelize.Op.like]: `%${Number(secondaryReferenceNumeric).toString()}`
            }
          }
        ]

      }
    })
  }
}

module.exports = checkDebtsByEnrichment
