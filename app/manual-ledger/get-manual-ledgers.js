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
  for (let i = 0; i < manualLedgers.length; i++) {
    if (manualLedgers[i].schemes.name === 'SFI') {
      manualLedgers[i].schemes.name = 'SFI22'
    }
  }
  return manualLedgers
}
module.exports = getManualLedgers
