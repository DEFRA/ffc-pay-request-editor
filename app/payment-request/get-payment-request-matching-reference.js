const { getSchemeIds } = require('ffc-pay-schemes')
const db = require('../data')

const { CS } = getSchemeIds()

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
