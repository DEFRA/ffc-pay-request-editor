const db = require('../data')

const getPaymentRequest = async () => {
  return db.paymentRequest.findAll(
    {
      include: [
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        }
      ],
      attributes: [
        'paymentRequestId',
        'frn',
        'agreementNumber',
        'invoiceNumber',
        'paymentRequestNumber',
        'value',
        'received',
        'receivedFormatted',
        'ledger'
      ],
      where: {
        categoryId: 1
      }
    })
}

const getPaymentRequestByInvoiceNumber = async (invoiceNumber) => {
  return db.paymentRequest.findOne({
    lock: true,
    skipLocked: true,
    where: {
      invoiceNumber
    }
  })
}

module.exports = {
  getPaymentRequest,
  getPaymentRequestByInvoiceNumber
}
