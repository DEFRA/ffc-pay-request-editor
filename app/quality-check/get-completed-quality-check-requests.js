const db = require('../data')

const getCompletedQualityCheckRequests = async () => {
  return db.paymentRequest.findAll({
    where: { released: { [db.Sequelize.Op.ne]: null } },
    include: [
      {
        model: db.invoiceLine,
        as: 'invoiceLines',
        attributes: [
          'schemeCode',
          'accountCode',
          'fundCode',
          'description',
          'value'
        ]
      },
      {
        model: db.debtData,
        as: 'debtData',
        attributes: [
          'debtType',
          'recoveryDate'
        ]
      }
    ],
    raw: true
  })
}

module.exports = getCompletedQualityCheckRequests
