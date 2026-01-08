const db = require('../data')

const getManualLedgers = async (statuses, page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize

  const where = {
    categoryId: 2
  }

  if (frn) {
    where.frn = frn
  }

  const options = {
    where,
    attributes: [
      'paymentRequestId',
      'marketingYear',
      'frn',
      'agreementNumber',
      'invoiceNumber',
      'paymentRequestNumber',
      'value',
      'received'
    ],
    include: [
      {
        model: db.scheme,
        as: 'schemes',
        attributes: ['name'],
        required: true
      },
      {
        model: db.qualityCheck,
        as: 'qualityChecks',
        attributes: [],
        required: true,
        where: { status: { [db.Sequelize.Op.in]: statuses } }
      }
    ]
  }

  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }
  console.log('Getting manual ledgers with options:', options)
  const manualLedgers = await db.paymentRequest.findAll(options)
  console.log(`Retrieved ${manualLedgers.length} manual ledgers`)
  for (const ledger of manualLedgers) {
    if (ledger.schemes?.name === 'SFI') {
      ledger.schemes.name = 'SFI22'
    }
  }

  return manualLedgers
}

module.exports = getManualLedgers
