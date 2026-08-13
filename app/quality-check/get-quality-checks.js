const db = require('../data')
const { PENDING } = require('./statuses')

const getQualityChecks = async (page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize

  const paymentRequestInclude = {
    model: db.paymentRequest,
    as: 'paymentRequest',
    where: { categoryId: 2 },
    required: true,
    attributes: [
      'paymentRequestId',
      'schemeId',
      'frn',
      'agreementNumber',
      'invoiceNumber',
      'paymentRequestNumber',
      'value',
      'valueText',
      'marketingYear'
    ],
    include: [{
      model: db.scheme,
      as: 'schemes',
      attributes: ['name']
    }, {
      model: db.manualLedgerPaymentRequest,
      as: 'manualLedgerChecks',
      attributes: ['createdBy', 'createdById'],
      where: { active: true }
    }]
  }
  if (frn) {
    paymentRequestInclude.where.frn = String(frn)
  }

  const options = {
    where: {
      status: PENDING
    },
    include: [paymentRequestInclude],
    distinct: true // ensures findAndCountAll's count isn't inflated by the joined includes
  }
  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }

  const result = await db.qualityCheck.findAndCountAll(options)

  const mergedQualityChecks = result.rows.map(qc => {
    const plainQc = qc.get({ plain: true })
    if (plainQc.paymentRequest?.schemes?.name === 'SFI') {
      plainQc.paymentRequest.schemes.name = 'SFI22'
    }
    return plainQc
  })

  return { rows: mergedQualityChecks, count: result.count }
}

module.exports = getQualityChecks
