const db = require('../data')
const getManualLedgerRequests = require('./get-manual-ledger-requests')

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

module.exports = getManualLedger
