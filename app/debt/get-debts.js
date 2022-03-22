const db = require('../data')

const getDebts = async () => {
  return db.debtData.findAll({
    where: { paymentRequestId: null },
    include: [
      {
        model: db.scheme,
        as: 'schemes',
        attributes: ['name']
      }
    ],
    attributes: [
      'debtDataId',
      'frn',
      'reference',
      'netValue',
      'debtType',
      'debtTypeText',
      'recoveryDate',
      'createdBy',
      'attachedDate'
    ]
  })
}

module.exports = getDebts
