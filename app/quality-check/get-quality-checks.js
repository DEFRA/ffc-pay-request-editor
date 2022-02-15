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
            'frn',
            'agreementNumber',
            'invoiceNumber',
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
