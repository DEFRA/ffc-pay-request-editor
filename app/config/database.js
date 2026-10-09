const isProd = () => process.env.NODE_ENV === 'production'

const dbConfig = {
  database: process.env.POSTGRES_DB || 'ffc_pay_request_editor',
  host: process.env.POSTGRES_HOST || 'ffc-pay-request-editor-postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  logging: process.env.POSTGRES_LOGGING || false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
  ssl: isProd(),
  username: process.env.POSTGRES_USERNAME
}

module.exports = dbConfig
