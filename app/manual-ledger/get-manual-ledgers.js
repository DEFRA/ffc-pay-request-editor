const db = require('../data')
const { replaceSFI22 } = require('../processing/replace-sfi22')

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
  const modifiedLedgerData = replaceSFI22(manualLedgers)
  return modifiedLedgerData
}
module.exports = getManualLedgers
