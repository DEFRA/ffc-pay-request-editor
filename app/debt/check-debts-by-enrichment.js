const db = require('../data')

const checkDebtsByEnrichment = async (frn, reference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return null
  } else {
    return db.debtData.findOne({
      transaction,
      where: {
        frn: parsedFrn,
        reference,
        netValue,
        debtType: {
          [db.Sequelize.Op.not]: null
        },
        recoveryDate: {
          [db.Sequelize.Op.not]: null
        }
      }
    })
  }
}

module.exports = checkDebtsByEnrichment
