const format = require('../../utils/date-formatter')
const { LEDGER_CHECK, LEDGER_ENRICHMENT } = require('../../payment-request/categories')
const { updatePaymentRequestCategory } = require('../../payment-request')
const { saveDebt } = require('../../debt')
const { updateQualityChecksStatus } = require('../../quality-check')
const { PENDING, PASSED } = require('../../quality-check/statuses')
const { sendEnrichRequestEvent } = require('../../event')
const { checkAwaitingManualLedgerDebtData } = require('../../manual-ledger')

const enrichRequest = async (user, payload, paymentRequest) => {
  const paymentRequestId = parseInt(payload['payment-request-id'])

  if (paymentRequest.categoryId === LEDGER_ENRICHMENT) {
    await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
    await updateQualityChecksStatus(paymentRequestId, PENDING)
  }

  const { schemeId, frn } = paymentRequest
  await saveDebt({
    paymentRequestId: paymentRequestId,
    schemeId: schemeId,
    frn: frn,
    reference: paymentRequest.agreementNumber,
    netValue: paymentRequest.netValue ?? paymentRequest.value,
    debtType: payload['debt-type'],
    recoveryDate: `${format(payload.day)}/${format(payload.month)}/${payload.year}`,
    createdDate: new Date(),
    createdBy: user.username,
    createdById: user.userId
  })

  const isAwaitingManualLedgerDebtData = await checkAwaitingManualLedgerDebtData(paymentRequestId)
  if (isAwaitingManualLedgerDebtData) {
    await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
    await updateQualityChecksStatus(paymentRequestId, PASSED)
  } else {
    await updateQualityChecksStatus(paymentRequestId, PENDING)
    await sendEnrichRequestEvent(paymentRequest, user)
  }
}

module.exports = { enrichRequest }
