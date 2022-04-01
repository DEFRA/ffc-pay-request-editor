const db = require('../data')
const { PENDING } = require('./statuses')

const getQualityChecks = async () => {
  const qualityChecks = await db.qualityCheck.findAll({
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
        attributes: ['createdBy', 'createdById'],
        where: { active: true }
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
        'valueText'
      ]
    }],
    attributes: [
      'status'
    ],
    where: {
      status: PENDING
    }
  })
  return qualityChecks.map(x => x.get({ plain: true }))
}

module.exports = getQualityChecks
