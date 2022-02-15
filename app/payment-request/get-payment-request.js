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
        'frn',
        'agreementNumber',
        'invoiceNumber',
        'paymentRequestNumber',
        'value',
        'received',
        'receivedFormatted'
      ]
    })
}

module.exports = getPaymentRequest
