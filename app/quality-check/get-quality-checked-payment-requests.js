const db = require('../data')
const { getManualLedgerRequests } = require('../manual-ledger')

const getQualityCheckedPaymentRequests = async () => {
  const qualityCheckedPaymentRequests = []

  const qualityChecks = await db.qualityCheck.findAll({
    include: [
      {
        model: db.paymentRequest,
        as: 'paymentRequest',
        where: { categoryId: 2 }
      }
    ],
    where: {
      status: 'Passed'
    }
  })

  for (const qualityCheck of qualityChecks) {
    const paymentRequest = qualityCheck.paymentRequest
    const manualLedgerRequests = await getManualLedgerRequests(paymentRequest.paymentRequestId)
    qualityCheckedPaymentRequests.push({ paymentRequest, paymentRequests: manualLedgerRequests })
  }

  return qualityCheckedPaymentRequests
}

module.exports = getQualityCheckedPaymentRequests
