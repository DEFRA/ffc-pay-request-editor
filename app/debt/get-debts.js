const { debtData } = require('../database')
const TABLES = require('../constants/tables')
const { addDebtDataFields } = require('../utils/computed-fields')

const DEBT_COLUMNS = [
  'debtDataId',
  'frn',
  'reference',
  'netValue',
  'debtType',
  'recoveryDate',
  'createdBy',
  'attachedDate',
  'paymentRequestId',
  'createdDate'
]

const buildFilteredQuery = ({ includeAttached, frn, scheme }) => {
  const query = debtData()
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.debtData}.schemeId`)
    .where(`${TABLES.debtData}.reference`, 'not like', 'Manual enrichment')

  if (!includeAttached) {
    query.whereNull(`${TABLES.debtData}.paymentRequestId`)
  }

  if (frn) {
    query.where(`${TABLES.debtData}.frn`, String(frn))
  }

  if (scheme) {
    query.where(`${TABLES.scheme}.name`, scheme)
  }

  return query
}

const getDebts = async ({
  includeAttached = false,
  page = 1,
  pageSize = 2500,
  usePagination = true,
  frn,
  scheme
} = {}) => {
  const offset = (page - 1) * pageSize
  const filters = { includeAttached, frn, scheme }

  const rowsQuery = buildFilteredQuery(filters)
    .select(
      ...DEBT_COLUMNS.map(column => `${TABLES.debtData}.${column}`),
      { schemeName: `${TABLES.scheme}.name` }
    )
    .orderBy(`${TABLES.debtData}.createdDate`, 'desc')

  if (usePagination) {
    rowsQuery.limit(pageSize).offset(offset)
  }

  const [rows, countResult] = await Promise.all([
    rowsQuery,
    buildFilteredQuery(filters).count({ count: '*' }).first()
  ])

  return {
    count: Number(countResult.count),
    rows: rows.map(({ schemeName, ...debt }) => ({
      ...addDebtDataFields(debt),
      schemes: { name: schemeName }
    }))
  }
}

module.exports = getDebts
