const { Database } = require('ffc-database')
const dbConfig = require('./config/database')
const TABLES = require('./constants/tables')

const database = new Database({ ...dbConfig, tables: TABLES })

module.exports = database.connect()
