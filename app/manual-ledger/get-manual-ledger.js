const db = require('../data')

const getManualLedger = async (paymentRequestId) => {
  return db.paymentRequest.findOne(
    {
      include: [
        {
          model: db.manualLedgerChecks,
          as: 'manualLedgerChecks'
        },
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        },
        {
          model: db.schedule,
          as: 'schedules',
          attributes: ['scheduleId']
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
}
module.exports = getManualLedger
