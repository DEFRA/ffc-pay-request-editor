const db = require('../data')
const { replaceSFI22 } = require('../processing/replace-sfi22')

const getManualLedgerRequests = async (paymentRequestId) => {
  const manualLedgerRequest = await db.manualLedgerPaymentRequest.findAll({
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
  const modifiedLedgerData = replaceSFI22(manualLedgerRequest)
  return modifiedLedgerData.map(x => x.get({ plain: true }))
}

module.exports = getManualLedgerRequests
