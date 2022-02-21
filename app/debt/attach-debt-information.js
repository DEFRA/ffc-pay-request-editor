const checkDebts = require('./check-debts')

const attachDebtInformation = async (frn, paymentRequestNumber, value, transaction) => {
  console.log(await checkDebts(frn, paymentRequestNumber, value, transaction))
}

module.exports = attachDebtInformation
