const { qualityCheck, manualLedgerPaymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { PENDING } = require('./statuses')
const { convertValueToStringFormat } = require('../processing/conversion')

const REQUEST_PREFIX = 'request_'

const PAYMENT_REQUEST_COLUMNS = [
  'paymentRequestId',
  'schemeId',
  'frn',
  'agreementNumber',
  'invoiceNumber',
  'paymentRequestNumber',
  'value',
  'marketingYear'
]

const buildFilteredQuery = (frn) => {
  const query = qualityCheck()
    .innerJoin(TABLES.paymentRequest, `${TABLES.paymentRequest}.paymentRequestId`, `${TABLES.qualityCheck}.paymentRequestId`)
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.paymentRequest}.schemeId`)
    .where(`${TABLES.qualityCheck}.status`, PENDING)
    .where(`${TABLES.paymentRequest}.categoryId`, 2)
    .whereIn(
      `${TABLES.paymentRequest}.paymentRequestId`,
      manualLedgerPaymentRequest().select('paymentRequestId').where({ active: true })
    )

  if (frn) {
    query.where(`${TABLES.paymentRequest}.frn`, String(frn))
  }

  return query
}

const getManualLedgerChecks = async (paymentRequestIds) => {
  if (paymentRequestIds.length === 0) {
    return []
  }
  return manualLedgerPaymentRequest()
    .select('paymentRequestId', 'createdBy', 'createdById')
    .whereIn('paymentRequestId', paymentRequestIds)
    .where({ active: true })
    .orderBy('manualLedgerPaymentRequestId', 'asc')
}

const getQualityChecks = async (page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize

  const rowsQuery = buildFilteredQuery(frn)
    .select(
      `${TABLES.qualityCheck}.*`,
      ...PAYMENT_REQUEST_COLUMNS.map(column => ({ [`${REQUEST_PREFIX}${column}`]: `${TABLES.paymentRequest}.${column}` })),
      { schemeName: `${TABLES.scheme}.name` }
    )
    .orderBy(`${TABLES.qualityCheck}.qualityCheckId`, 'asc')

  if (usePagination) {
    rowsQuery.limit(pageSize).offset(offset)
  }

  const [rows, countResult] = await Promise.all([
    rowsQuery,
    buildFilteredQuery(frn).count({ count: '*' }).first()
  ])

  const manualLedgerChecks = await getManualLedgerChecks(rows.map(x => x.request_paymentRequestId))

  const qualityChecks = rows.map(row => {
    const paymentRequest = { schemes: { name: row.schemeName } }
    const qualityCheckRow = {}
    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith(REQUEST_PREFIX)) {
        paymentRequest[key.slice(REQUEST_PREFIX.length)] = value
      } else if (key !== 'schemeName') {
        qualityCheckRow[key] = value
      }
    }
    paymentRequest.valueText = convertValueToStringFormat(paymentRequest.value)
    paymentRequest.manualLedgerChecks = manualLedgerChecks
      .filter(x => x.paymentRequestId === paymentRequest.paymentRequestId)
      .map(({ createdBy, createdById }) => ({ createdBy, createdById }))
    return { ...qualityCheckRow, paymentRequest }
  })

  return { rows: qualityChecks, count: Number(countResult.count) }
}

module.exports = getQualityChecks
