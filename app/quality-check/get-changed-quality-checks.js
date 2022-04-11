const db = require('../data')

const getChangedQualityChecks = async (qualityChecks) => {
  const changedQualityChecks = qualityChecks.map(x => x.get({ plain: true }))
  for (const qualityCheck of changedQualityChecks) {
    const dismissedLedgerAssignments = await db.manualLedgerPaymentRequest.findAll({
      where: {
        paymentRequestId: qualityCheck.paymentRequest.paymentRequestId,
        active: false
      }
    })
    qualityCheck.hasDismissed = dismissedLedgerAssignments.length > 0 ? 'Yes' : 'No'
  }
  return changedQualityChecks
}

module.exports = getChangedQualityChecks
