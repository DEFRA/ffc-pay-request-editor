const db = require('../data')
const { getManualLedgerRequests } = require('../manual-ledger')
const { PASSED } = require('./statuses')

const getQualityCheckedPaymentRequests = async () => {
  const qualityCheckedPaymentRequests = []

  const qualityChecks = await db.qualityCheck.findAll({
    include: [
      {
        model: db.paymentRequest,
        as: 'paymentRequest',
        where: { categoryId: 2 },
        include: [{
          model: db.invoiceLine,
          as: 'invoiceLines'
        }]
      }
    ],
    where: {
      status: PASSED
    }
  })

  if (qualityChecks.length > 0) {
    for (const qualityCheck of qualityChecks) {
      const paymentRequest = qualityCheck.paymentRequest
      const manualLedgerRequests = await getManualLedgerRequests(paymentRequest.paymentRequestId)
      const transformManualLedgerRequest = manualLedgerRequests.map(x => x.ledgerPaymentRequest)
      qualityCheckedPaymentRequests.push({ paymentRequest: paymentRequest, paymentRequests: transformManualLedgerRequest })
    }
  }

  return qualityCheckedPaymentRequests.map(x => {
    return {
      paymentRequest: x.paymentRequest.get({ plain: true }),
      paymentRequests: x.paymentRequests.map(y => y.get({ plain: true }))
    }
  })
}

module.exports = getQualityCheckedPaymentRequests
