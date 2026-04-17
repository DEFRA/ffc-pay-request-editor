const db = require('../data')
const { findPaymentRequests } = require('./find-payment-requests')
const { removeDebtData } = require('./remove-debt-data')
const { removeInvoiceLines } = require('./remove-invoice-lines')
const { removeManualLedgerPaymentRequest } = require('./remove-manual-ledger-payment-request')
const { removePaymentRequests } = require('./remove-payment-requests')
const { removeQualityChecks } = require('./remove-quality-checks')

const removeAgreementData = async (retentionData) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { agreementNumber, frn, schemeId } = retentionData

    const paymentRequests = await findPaymentRequests(agreementNumber, frn, schemeId, transaction)
    const paymentRequestIds = paymentRequests.map(pr => pr.paymentRequestId)
    if (paymentRequests.length === 0) {
      console.log('No payment request related agreement data to remove')
      await transaction.commit()
      return
    }

    await removeDebtData(paymentRequestIds, transaction)
    await removeQualityChecks(paymentRequestIds, transaction)
    await removeManualLedgerPaymentRequest(paymentRequestIds, transaction)
    await removeInvoiceLines(paymentRequestIds, transaction)
    await removePaymentRequests(paymentRequestIds, transaction)

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = {
  removeAgreementData
}
