const db = require('../data')

const getQualityCheckedPaymentRequests = async () => {
  const debtDatas = await db.debtData.findAll({
    where: {
      [db.Sequelize.Op.and]: [{
        debtType: { [db.Sequelize.Op.ne]: null },
        recoveryDate: { [db.Sequelize.Op.ne]: null }
      }]
    }
  })

  const debtDataIds = debtDatas.map(x => x?.paymentRequestId)

  return db.paymentRequest.findAll({
    where: {
      released: { [db.Sequelize.Op.eq]: null },
      paymentRequestId: { [db.Sequelize.Op.in]: debtDataIds }
    },
    include: [
      {
        model: db.debtData,
        as: 'debtData',
        attributes: []
      }
    ],
    attributes: [
      'paymentRequestId',
      'invoiceNumber',
      'frn',
      [db.Sequelize.col('debtData.debtType'), 'debtType'],
      [db.Sequelize.col('debtData.recoveryDate'), 'recoveryDate']
    ],
    raw: true
  })
}

module.exports = getQualityCheckedPaymentRequests
