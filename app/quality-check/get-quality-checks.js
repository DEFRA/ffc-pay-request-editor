const db = require('../data')
const getChangedQualityChecks = require('./get-changed-quality-checks')
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
        'valueText',
        'marketingYear'
      ]
    }],
    attributes: [
      'status'
    ],
    where: {
      status: PENDING
    }
  })
  return getChangedQualityChecks(qualityChecks)
}

module.exports = getQualityChecks
