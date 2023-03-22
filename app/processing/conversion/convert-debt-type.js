const {
  DEBT_IDS,
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR_TEXT
} = require('../../constants/debt-types')

const convertDebtIdToText = (debtId) => {
  if (DEBT_IDS.some(x => x === debtId)) {
    return debtId === ADMINISTRATIVE ? ADMINISTRATIVE_TEXT : IRREGULAR_TEXT
  }
  return ''
}

module.exports = {
  convertDebtIdToText
}
