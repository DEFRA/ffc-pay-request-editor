const db = require('../data')

const getDebts = async (includeAttached = false, page = 1, pageSize = 2000) => {
  const offset = (page - 1) * pageSize
  const where = includeAttached ? { reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } } : { paymentRequestId: null, reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } }
  const debtData = await db.debtData.findAll({
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
    order: [['createdDate', 'DESC']],
    limit: pageSize,
    offset
  })
  for (let i = 0; i < debtData.length; i++) {
    if (debtData[i].schemes?.name === 'SFI') {
      debtData[i].schemes.name = 'SFI22'
    }
  }
  return debtData
}

module.exports = getDebts
