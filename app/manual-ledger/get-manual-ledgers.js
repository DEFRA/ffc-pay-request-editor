const db = require('../data')
const { convertValueToStringFormat } = require('../processing/conversion')

const getManualLedgers = async (statuses, page = 1, pageSize = 100, usePagination = true, frn = null) => {
  const offset = (page - 1) * pageSize

  // this has been rewritten into raw SQL rather than using sequelize for performance reasons
  const replacements = {
    categoryId: 2,
    statuses,
    limit: pageSize,
    offset
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
    WHERE "pr"."categoryId" = :categoryId
      AND "qc"."status" IN (:statuses)
  `

  if (frn) {
    sql += ' AND "pr"."frn" = :frn'
    replacements.frn = frn
  }

  sql += ' ORDER BY "pr"."paymentRequestId"'
  if (usePagination) {
    sql += ' LIMIT :limit OFFSET :offset'
  }

  console.log('Getting manual ledgers, SQL built successfully')
  const manualLedgers = await db.sequelize.query(sql, {
    replacements,
    type: db.sequelize.QueryTypes.SELECT
  })
  console.log(`Retrieved ${manualLedgers.length} manual ledgers`)

  for (const ledger of manualLedgers) {
    if (ledger.schemeName === 'SFI') {
      ledger.schemeName = 'SFI22'
    }

    ledger.valueText = convertValueToStringFormat(ledger.value)

    if (ledger.received) {
      const receivedDate = new Date(ledger.received)
      ledger.receivedFormatted = receivedDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } else {
      ledger.receivedFormatted = ''
    }
  }

  return manualLedgers
}

module.exports = getManualLedgers
