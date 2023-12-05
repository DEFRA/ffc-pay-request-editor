const db = require('../data')
const { replaceSFI22 } = require('../processing/replace-sfi22')

const getDebts = async (includeAttached = false) => {
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
    order: [['createdDate', 'DESC']]
  })
  const modifiedDebtData = replaceSFI22(debtData)
  return modifiedDebtData
}

module.exports = getDebts
