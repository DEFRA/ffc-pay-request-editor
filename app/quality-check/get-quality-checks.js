const db = require('../data')

const getQualityChecks = async () => {
  return db.qualityCheck.findAll({
    include: [{
      model: db.paymentRequest,
      as: 'paymentRequest',
      include: [{
        model: db.scheme,
        as: 'schemes',
        attributes: ['name']
      }, {
        model: db.manualLedgerPaymentRequest,
        as: 'manualLedgerChecks',
        attributes: ['createdBy', 'createdById']
      }],
      where: {
        categoryId: 2
      },
      attributes: [
        'paymentRequestId',
        'frn',
        'agreementNumber',
        'invoiceNumber',
        'paymentRequestNumber',
        'value',
        'valueDecimal'
      ]
    }],
    attributes: [
      'status'
    ],
    where: {
      status: 'Pending'
    }
  })
}

module.exports = getQualityChecks
