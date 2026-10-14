const { getSchemeIds } = require('ffc-pay-schemes')

const { CS } = getSchemeIds()

const getPaymentRequestMatchingReference = (schemeId, applicationIdentifier) => {
  if (schemeId === CS) {
    return {
      column: 'contractNumber',
      values: [applicationIdentifier, applicationIdentifier?.replace('A0', 'A')]
    }
  }
  return {
    column: 'agreementNumber',
    values: [applicationIdentifier]
  }
}

module.exports = {
  getPaymentRequestMatchingReference
}
