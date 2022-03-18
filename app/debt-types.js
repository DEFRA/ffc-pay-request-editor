const DEBT_TYPES = [{ id: 'adm', text: 'Administrative' }, { id: 'irr', text: 'Irregular' }]

const DEBT_IDS = DEBT_TYPES.map(debt => debt.id)

const ADMINISTRATIVE = DEBT_TYPES.find(debt => debt.id === 'adm').id
const ADMINISTRATIVE_TEXT = DEBT_TYPES.find(debt => debt.id === 'adm').text

const IRREGULAR = DEBT_TYPES.find(debt => debt.id === 'irr').id
const IRREGULAR_TEXT = DEBT_TYPES.find(debt => debt.id === 'irr').text

module.exports = {
  DEBT_IDS,
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR,
  IRREGULAR_TEXT
}
