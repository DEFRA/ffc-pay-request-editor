const toDebtRow = (debt) => ({
  paymentRequestId: debt.paymentRequestId,
  schemeId: debt.schemeId,
  frn: debt.frn,
  reference: debt.reference,
  netValue: debt.netValue,
  debtType: debt.debtType,
  recoveryDate: debt.recoveryDate,
  attachedDate: debt.attachedDate,
  createdDate: debt.createdDate,
  createdBy: debt.createdBy,
  createdById: debt.createdById
})

module.exports = toDebtRow
