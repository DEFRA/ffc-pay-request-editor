const db = require('../data')

const getManualLedgers = async (statuses, page = 1, pageSize = 100, usePagination = true) => {
  const offset = (page - 1) * pageSize
  const options = {
    include: [
      {
        model: db.scheme,
        as: 'schemes',
        attributes: ['name']
      },
      {
        model: db.qualityCheck,
        as: 'qualityChecks',
        where: { status: statuses }
      }
    ],
    where: { categoryId: 2 }
  }
  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }
  const manualLedgers = await db.paymentRequest.findAll(options)
  for (const ledger of manualLedgers) {
    if (ledger.schemes?.name === 'SFI') {
      ledger.schemes.name = 'SFI22'
    }
  }
  return manualLedgers
}
module.exports = getManualLedgers
