const db = require('../data')
const getManualLedgerRequestCheck = require('../manual-ledger/get-manual-ledger-requests')
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
      const manualLedgerRequests = await getManualLedgerRequestCheck(paymentRequest.paymentRequestId)
      const transformManualLedgerRequest = manualLedgerRequests.map(x => x.ledgerPaymentRequest)
      qualityCheckedPaymentRequests.push({ paymentRequest: paymentRequest, paymentRequests: transformManualLedgerRequest })
    }
  }

  return qualityCheckedPaymentRequests.map(x => {
    return {
      paymentRequest: x.paymentRequest.get({ plain: true }),
      paymentRequests: x.paymentRequests
    }
  })
}

module.exports = getQualityCheckedPaymentRequests
