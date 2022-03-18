const db = require('../data')

const getManualLedger = async (paymentRequestId) => {
  const paymentRequest = await db.paymentRequest.findOne(
    {
      include: [
        {
          model: db.manualLedgerPaymentRequest,
          as: 'manualLedgerChecks',
          where: { active: true }
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

  paymentRequest.manualLedgerChecks = []
  paymentRequest.manualLedgerChecks = await getManualLedgerRequests(paymentRequestId)

  return paymentRequest
}

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

module.exports = getManualLedger
