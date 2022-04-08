const db = require('../data')

const getDebts = async (includeAttached = false) => {
  const where = includeAttached ? {} : { paymentRequestId: null }
  return db.debtData.findAll({
    where,
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
      'netValueText',
      'debtType',
      'debtTypeText',
      'recoveryDate',
      'createdBy',
      'attachedDate',
      'paymentRequestId'
    ],
    order: [['createdDate', 'DESC']]
  })
}

module.exports = getDebts
