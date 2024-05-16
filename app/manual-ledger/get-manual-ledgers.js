const db = require('../data')

const getManualLedgers = async (statuses) => {
  const manualLedgers = await db.paymentRequest.findAll(
    {
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
  )
  for (const ledger of manualLedgers) {
    if (ledger.schemes?.name === 'SFI') {
      ledger.schemes.name = 'SFI22'
    }
  }
  return manualLedgers
}
module.exports = getManualLedgers
