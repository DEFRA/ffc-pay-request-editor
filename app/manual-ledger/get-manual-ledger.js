const db = require('../data')

const getManualLedger = async (paymentRequestId) => {
  return db.paymentRequest.findOne(
    {
      include: [
        {
          model: db.manualLedgerPaymentRequest,
          as: 'manualLedgerChecks',
          where: { active: true },
          include: [{
            model: db.paymentRequest,
            as: 'ledgerPaymentRequest',
            include: [{
              model: db.invoiceLine,
              as: 'invoiceLines'
            }]
          }]
        },
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        },
        {
          model: db.invoiceLine,
          as: 'invoiceLines'
        }
      ]
    },
    {
      where: { paymentRequestId }
    })
}
module.exports = getManualLedger
