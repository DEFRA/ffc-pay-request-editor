const db = require('../data')
const { getManualLedgerRequests } = require('../manual-ledger')

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
      status: 'Passed'
    }
  })

  if (qualityChecks.length > 0) {
    for (const qualityCheck of qualityChecks) {
      const paymentRequest = qualityCheck.paymentRequest
      const manualLedgerRequests = await getManualLedgerRequests(paymentRequest.paymentRequestId)
      const transfromManualLedgerRequest = manualLedgerRequests.map(x => x.ledgerPaymentRequest)
      qualityCheckedPaymentRequests.push({ paymentRequest: paymentRequest, paymentRequests: transfromManualLedgerRequest })
    }
  }

  return qualityCheckedPaymentRequests
}

module.exports = getQualityCheckedPaymentRequests
