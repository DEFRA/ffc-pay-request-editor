const db = require('../data')

const getQualityChecks = async () => {
  return db.qualityCheck.findAll(
    {
      include: [
        {
          model: db.paymentRequest,
          as: 'paymentRequest',
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
            'value'
          ]
        }
      ],
      attributes: [
        'status'
      ]
    }
  )
}

module.exports = getQualityChecks
