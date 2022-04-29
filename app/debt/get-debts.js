const db = require('../data')

const getDebts = async (includeAttached = false) => {
  const where = includeAttached ? { reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } } : { paymentRequestId: null, reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } }
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
      'paymentRequestId',
      'createdDate'
    ],
    order: [['createdDate', 'DESC']]
  })
}

module.exports = getDebts
