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
        'value',
        'received'
      ]
    })
}

module.exports = getPaymentRequest
