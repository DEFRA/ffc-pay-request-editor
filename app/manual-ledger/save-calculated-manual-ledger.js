const db = require('../database')
const { manualLedgerPaymentRequest } = db
const TABLES = require('../constants/tables')
const { savePaymentAndInvoiceLines } = require('../payment-request')
const { PROVISIONAL_LEDGER_CHECK } = require('../payment-request/categories')
const saveManualLedger = require('./save-manual-ledger')

const saveCalculatedManualLedger = async (calculatedManualLedgers) => {
  const transaction = await db.transaction()
  try {
    const paymentRequestId = calculatedManualLedgers.paymentRequestId
    const provisionalLedgerData = calculatedManualLedgers.provisionalLedgerData

    await updateManualLedger(paymentRequestId, transaction)

    for (const paymentRequest of provisionalLedgerData) {
      await saveProvisionalLedger(paymentRequestId, paymentRequest, transaction) // NOSONAR
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

const saveProvisionalLedger = async (paymentRequestId, paymentRequest, transaction) => {
  const ledgerPaymentRequest = paymentRequest.ledgerPaymentRequest
  const matchingPaymentRequest = await manualLedgerPaymentRequest(transaction ?? undefined)
    .select(`${TABLES.manualLedgerPaymentRequest}.manualLedgerPaymentRequestId`)
    .innerJoin(TABLES.paymentRequest, `${TABLES.paymentRequest}.paymentRequestId`, `${TABLES.manualLedgerPaymentRequest}.ledgerPaymentRequestId`)
    .where({
      [`${TABLES.manualLedgerPaymentRequest}.paymentRequestId`]: paymentRequestId,
      [`${TABLES.manualLedgerPaymentRequest}.original`]: true,
      [`${TABLES.paymentRequest}.value`]: ledgerPaymentRequest.value,
      [`${TABLES.paymentRequest}.ledger`]: ledgerPaymentRequest.ledger,
      [`${TABLES.paymentRequest}.categoryId`]: PROVISIONAL_LEDGER_CHECK
    })
    .first()
  if (matchingPaymentRequest) {
    await manualLedgerPaymentRequest(transaction ?? undefined)
      .where({ manualLedgerPaymentRequestId: matchingPaymentRequest.manualLedgerPaymentRequestId })
      .update({ active: true })
  } else {
    const paymentRequestLedgerId = await savePaymentAndInvoiceLines(ledgerPaymentRequest, PROVISIONAL_LEDGER_CHECK, transaction)
    await saveManualLedger(paymentRequestId, paymentRequestLedgerId, false, transaction)
  }
}

const updateManualLedger = async (paymentRequestId, transaction) => {
  return manualLedgerPaymentRequest(transaction ?? undefined).where({ paymentRequestId }).update({ active: false })
}

module.exports = saveCalculatedManualLedger
