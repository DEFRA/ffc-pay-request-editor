const db = require('../data')
const { PENDING } = require('./statuses')

const getQualityChecks = async (page = 1, pageSize = 100, usePagination = true) => {
  const offset = (page - 1) * pageSize
  const options = {
    where: {
      status: PENDING
    }
  }
  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }
  const qualityChecks = await db.qualityCheck.findAll(options)
  const paymentRequestIds = qualityChecks.map(qc => qc.paymentRequestId)
  const paymentRequests = await db.paymentRequest.findAll({
    where: {
      paymentRequestId: paymentRequestIds,
      categoryId: 2
    },
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
    ]
  })

  const paymentRequestMap = paymentRequests.reduce((map, pr) => {
    map[pr.paymentRequestId] = pr
    return map
  }, {})
  const mergedQualityChecks = qualityChecks.map(qc => {
    const plainQc = qc.get({ plain: true })
    plainQc.paymentRequest = paymentRequestMap[qc.paymentRequestId]

    if (plainQc.paymentRequest?.schemes?.name === 'SFI') {
      plainQc.paymentRequest.schemes.name = 'SFI22'
    }

    return plainQc
  })

  return mergedQualityChecks
}

module.exports = getQualityChecks
