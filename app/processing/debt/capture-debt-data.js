const db = require('../../data')
const { LEDGER_CHECK, LEDGER_ENRICHMENT } = require('../../payment-request/categories')
const { PENDING } = require('../../quality-check/statuses')
const { getSchemeId } = require('../../processing/scheme')
const { convertToPence, convertDateToDDMMYYYY } = require('../../processing/conversion')
const { saveDebtData } = require('./save-debt-data')
const { getPaymentRequestAwaitingEnrichment } = require('../../payment-request/get-payment-request')
const { getUser } = require('../../auth')
const { updateQualityChecksStatus } = require('../../quality-check')
const { updatePaymentRequestCategory } = require('../../payment-request')

const captureDebtData = async (request) => {
  const { scheme, frn, applicationIdentifier, net, debtType } = request.payload
  const netValue = convertToPence(String(net))
  const schemeId = await getSchemeId(scheme)
  const recoveryDate = convertDateToDDMMYYYY(...['debt-discovered-day', 'debt-discovered-month', 'debt-discovered-year'].map(key => request.payload[key]))
  const { userId, username } = getUser(request)

  const transaction = await db.sequelize.transaction()
  try {
    const debtData = {
      paymentRequestId: undefined,
      schemeId,
      frn,
      reference: applicationIdentifier,
      netValue,
      debtType,
      recoveryDate,
      attachedDate: undefined,
      createdDate: new Date(),
      createdBy: username,
      createdById: userId
    }

    const matchingPaymentRequest = await getPaymentRequestAwaitingEnrichment(schemeId, frn, applicationIdentifier, netValue)

    if (matchingPaymentRequest) {
      debtData.paymentRequestId = matchingPaymentRequest.paymentRequestId

      if (matchingPaymentRequest.categoryId === LEDGER_ENRICHMENT) {
        const paymentRequestId = matchingPaymentRequest.paymentRequestId
        await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
        await updateQualityChecksStatus(paymentRequestId, PENDING)
      }
    }

    await saveDebtData(debtData, transaction)
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = { captureDebtData }
