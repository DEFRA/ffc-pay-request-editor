const { debtData } = require('../database')

const checkDebts = async (schemeId, frn, reference, secondaryReference, netValue, transaction) => {
  const parsedFrn = parseInt(frn)

  if (isNaN(parsedFrn)) {
    return {}
  } else {
    const referenceNumeric = reference.match(/\d+/)[0]
    const secondaryReferenceNumeric = secondaryReference.match(/\d+/)[0]
    const found = await debtData(transaction ?? undefined)
      .where({ schemeId, frn: parsedFrn, netValue })
      .whereNull('paymentRequestId')
      .where(function () {
        this.where({ reference })
          .orWhere({ reference: secondaryReference })
          .orWhere('reference', 'like', `%${Number(referenceNumeric).toString()}`)
          .orWhere('reference', 'like', `%${Number(secondaryReferenceNumeric).toString()}`)
      })
      .first()
    return found ?? null
  }
}

module.exports = checkDebts
