const db = require('../data')

const getManualLedgerRequests = async (paymentRequestId) => {
  return db.manualLedgerPaymentRequest.findAll({
    include: [{
      model: db.paymentRequest,
      as: 'ledgerPaymentRequest',
      include: [{
        model: db.invoiceLine,
        as: 'invoiceLines'
      },
      {
        model: db.scheme,
        as: 'schemes'
      }]
    }],
    where: {
      paymentRequestId,
      active: true
    }
  })
}

module.exports = getManualLedgerRequests
