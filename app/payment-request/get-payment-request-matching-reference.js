const db = require('../data')
const { CS } = require('../constants/schemes')

const getPaymentRequestMatchingReference = (schemeId, applicationIdentifier) => {
  if (schemeId === CS) {
    return {
      [db.Sequelize.Op.or]: [
        { contractNumber: applicationIdentifier },
        { contractNumber: applicationIdentifier?.replace('A0', 'A') }
      ]
    }
  }
  return {
    agreementNumber: applicationIdentifier
  }
}

module.exports = {
  getPaymentRequestMatchingReference
}
