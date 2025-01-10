const db = require('../data')

const getManualLedgerRequests = async (paymentRequestId) => {
  const manualLedgerRequest = await db.manualLedgerPaymentRequest.findAll({
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
  for (const request of manualLedgerRequest) {
    if (request.ledgerPaymentRequest.schemes?.name === 'SFI') {
      request.ledgerPaymentRequest.schemes.name = 'SFI22'
    }
  }
  return manualLedgerRequest.map(x => x.get({ plain: true }))
}

module.exports = getManualLedgerRequests
