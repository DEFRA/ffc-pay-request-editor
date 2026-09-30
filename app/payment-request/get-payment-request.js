const { paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')
const { getPaymentRequestMatchingReference } = require('./get-payment-request-matching-reference')
const { addPaymentRequestFields } = require('../utils/computed-fields')

const PAYMENT_REQUEST_COLUMNS = [
  'paymentRequestId',
  'frn',
  'agreementNumber',
  'invoiceNumber',
  'paymentRequestNumber',
  'value',
  'received',
  'ledger',
  'marketingYear',
  'netValue',
  'fesCode',
  'annualValue',
  'remittanceDescription'
]

const buildAwaitingDebtQuery = (frn) => {
  const query = paymentRequest()
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.paymentRequest}.schemeId`)
    .leftJoin(TABLES.debtData, `${TABLES.debtData}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .whereNull(`${TABLES.debtData}.debtDataId`)
    .whereIn(`${TABLES.paymentRequest}.categoryId`, [ENRICHMENT, LEDGER_ENRICHMENT])

  if (frn) {
    query.where(`${TABLES.paymentRequest}.frn`, String(frn))
  }

  return query
}

const getPaymentRequest = async (page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize

  const rowsQuery = buildAwaitingDebtQuery(frn)
    .select(
      ...PAYMENT_REQUEST_COLUMNS.map(column => `${TABLES.paymentRequest}.${column}`),
      { schemeName: `${TABLES.scheme}.name` }
    )
    .orderBy(`${TABLES.paymentRequest}.received`, 'asc')

  if (usePagination) {
    rowsQuery.limit(pageSize).offset(offset)
  }

  const [rows, countResult] = await Promise.all([
    rowsQuery,
    buildAwaitingDebtQuery(frn).count({ count: '*' }).first()
  ])

  return {
    count: Number(countResult.count),
    rows: rows.map(({ schemeName, ...payment }) => ({
      ...addPaymentRequestFields(payment),
      schemes: { name: schemeName },
      debtData: null
    }))
  }
}

const getPaymentRequestByInvoiceNumberAndRequestId = async (invoiceNumber, paymentRequestId) => {
  const row = await paymentRequest()
    .select(`${TABLES.paymentRequest}.*`, { schemeName: `${TABLES.scheme}.name` })
    .leftJoin(TABLES.scheme, `${TABLES.scheme}.schemeId`, `${TABLES.paymentRequest}.schemeId`)
    .where({
      [`${TABLES.paymentRequest}.invoiceNumber`]: invoiceNumber,
      [`${TABLES.paymentRequest}.paymentRequestId`]: paymentRequestId
    })
    .first()

  if (!row) {
    return null
  }

  const { schemeName, ...payment } = row
  return { ...payment, schemes: { name: schemeName } }
}

const getPaymentRequestAwaitingEnrichment = async (schemeId, frn, applicationIdentifier, netValue, categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
  const { column, values } = getPaymentRequestMatchingReference(schemeId, applicationIdentifier)
  const query = paymentRequest()
    .select(`${TABLES.paymentRequest}.*`)
    .leftJoin(TABLES.debtData, `${TABLES.debtData}.paymentRequestId`, `${TABLES.paymentRequest}.paymentRequestId`)
    .whereNull(`${TABLES.debtData}.debtDataId`)
    .whereNull(`${TABLES.paymentRequest}.released`)
    .where(`${TABLES.paymentRequest}.schemeId`, schemeId)
    .where(`${TABLES.paymentRequest}.frn`, frn)
    .where(function () {
      this.where(`${TABLES.paymentRequest}.value`, netValue).orWhere(`${TABLES.paymentRequest}.netValue`, netValue)
    })
    .whereIn(`${TABLES.paymentRequest}.categoryId`, [].concat(categoryId))

  // Preserved from the Sequelize query: the contract number condition used for CS shared an [Op.or] key with the
  // value/netValue condition and was silently overwritten, so it was never applied. Only agreementNumber is filtered.
  if (column === 'agreementNumber') {
    query.whereIn(`${TABLES.paymentRequest}.${column}`, values)
  }

  return (await query.first()) ?? null
}

const getPaymentRequestByRequestId = async (paymentRequestId) => {
  return (await paymentRequest().where({ paymentRequestId }).first()) ?? null
}

module.exports = {
  getPaymentRequest,
  getPaymentRequestByInvoiceNumberAndRequestId,
  getPaymentRequestAwaitingEnrichment,
  getPaymentRequestByRequestId
}
