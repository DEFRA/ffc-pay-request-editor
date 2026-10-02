const db = require('../database')
const { convertValueToStringFormat } = require('../processing/conversion')
const { LEDGER_CHECK } = require('../payment-request/categories')

const getManualLedgers = async (statuses, page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize
  const replacements = {
    categoryId: LEDGER_CHECK,
    statuses,
    limit: pageSize,
    offset
  }
  let whereClause = `
    WHERE "pr"."categoryId" = :categoryId
      AND "qc"."status" = ANY(:statuses)
  `
  if (frn) {
    whereClause += ' AND "pr"."frn" = :frn'
    replacements.frn = frn
  }

  let sql = `
    SELECT 
      "pr"."paymentRequestId",
      "pr"."marketingYear",
      "pr".frn,
      "pr"."agreementNumber",
      "pr"."invoiceNumber",
      "pr"."paymentRequestNumber",
      "pr".value,
      "pr".received,
      "s".name AS "schemeName"
    FROM "paymentRequests" "pr"
    INNER JOIN "schemes" "s" ON "s"."schemeId" = "pr"."schemeId"
    INNER JOIN "qualityChecks" "qc" ON "qc"."paymentRequestId" = "pr"."paymentRequestId"
    ${whereClause}
    ORDER BY "pr"."paymentRequestId"
  `
  if (usePagination) {
    sql += ' LIMIT :limit OFFSET :offset'
  }

  const countSql = `
    SELECT COUNT(*) AS count
    FROM "paymentRequests" "pr"
    INNER JOIN "schemes" "s" ON "s"."schemeId" = "pr"."schemeId"
    INNER JOIN "qualityChecks" "qc" ON "qc"."paymentRequestId" = "pr"."paymentRequestId"
    ${whereClause}
  `

  console.log('Getting manual ledgers, SQL built successfully')
  const [manualLedgersResult, countResult] = await Promise.all([
    db.client.raw(sql, replacements),
    db.client.raw(countSql, replacements)
  ])
  const manualLedgers = manualLedgersResult.rows
  console.log(`Retrieved ${manualLedgers.length} manual ledgers`)

  for (const ledger of manualLedgers) {
    ledger.valueText = convertValueToStringFormat(ledger.value)
    if (ledger.received) {
      const receivedDate = new Date(ledger.received)
      ledger.receivedFormatted = receivedDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } else {
      ledger.receivedFormatted = ''
    }
  }

  return { rows: manualLedgers, count: Number(countResult.rows[0].count) }
}

module.exports = getManualLedgers
