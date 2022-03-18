const db = require('../data')

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

const getManualLedgerRequests = async (paymentRequestId) => {
  const manualLedgerPaymentRequests = await db.manualLedgerPaymentRequest.findAll({
    include: [{
      model: db.paymentRequest,
      as: 'ledgerPaymentRequest',
      include: [{
        model: db.invoiceLine,
        as: 'invoiceLines'
      }]
    }],
    where: {
      paymentRequestId,
      active: true
    }
  })

  return manualLedgerPaymentRequests.map(x => x.ledgerPaymentRequest)
}

module.exports = getQualityCheckedPaymentRequests
