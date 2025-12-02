const { AR } = require('../../app/processing/ledger/ledgers')

module.exports = [{
  ledgerPaymentRequest: {
    frn: 10000001,
    agreementNumber: 'SIP000000000V1',
    ledger: AR,
    value: -20,
    netValue: -2000
  }
}]
