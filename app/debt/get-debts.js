const db = require('../data')

const getDebts = async () => {
  return db.debtData.findAll(
    {
      include: [
        {
          model: db.scheme,
          as: 'schemes',
          attributes: ['name']
        },
        {
          model: db.paymentRequest,
          as: 'paymentRequests',
          attributes: ['agreementNumber']
        }
      ],
      attributes: [
        'frn',
        'netValue',
        'debtType',
        'attachedDate',
        'createdBy',
        'attachedDateFormatted'
      ]
    })
}

module.exports = getDebts
