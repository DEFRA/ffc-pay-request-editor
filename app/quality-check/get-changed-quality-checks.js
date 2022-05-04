const db = require('../data')

const getChangedQualityChecks = async (qualityChecks) => {
  for (const qualityCheck of qualityChecks) {
    const dismissedLedgerAssignments = await db.manualLedgerPaymentRequest.findAll({
      where: {
        paymentRequestId: qualityCheck.paymentRequest.paymentRequestId,
        active: false
      }
    })
    qualityCheck.hasDismissed = dismissedLedgerAssignments.length > 0 ? 'Yes' : 'No'
  }
  return qualityChecks
}

module.exports = getChangedQualityChecks
