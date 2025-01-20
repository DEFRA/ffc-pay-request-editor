const db = require('../data')

const getDebts = async ({ includeAttached = false, page = 1, pageSize = 2500, usePagination = true } = {}) => {
  const offset = (page - 1) * pageSize
  const where = includeAttached ? { reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } } : { paymentRequestId: null, reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } }
  const options = {
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
  }
  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }

  const debtData = await db.debtData.findAll(options)
  for (const debt of debtData) {
    if (debt.schemes?.name === 'SFI') {
      debt.schemes.name = 'SFI22'
    }
  }
  return debtData
}
module.exports = getDebts
