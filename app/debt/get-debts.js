const db = require('../data')

const getDebts = async () => {
  return db.debtData.findAll(
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
