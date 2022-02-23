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
      ]
    })
}

module.exports = getPaymentRequest
