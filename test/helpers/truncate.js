const db = require('../../app/database')

const tables = [
  'invoiceLines',
  'debtData',
  'manualLedgerPaymentRequest',
  'qualityChecks',
  'paymentRequests',
  'schemes'
]

const truncate = async (tablesToTruncate = tables) => {
  const quoted = tablesToTruncate.map(table => `"${table}"`).join(', ')
  await db.client.raw(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`)
}

module.exports = {
  truncate
}
