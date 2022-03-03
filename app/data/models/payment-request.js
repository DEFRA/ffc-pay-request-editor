const { convertToPounds } = require('../../currency-convert')

module.exports = (sequelize, DataTypes) => {
  const paymentRequest = sequelize.define('paymentRequest', {
    paymentRequestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schemeId: DataTypes.INTEGER,
    sourceSystem: DataTypes.STRING,
    deliveryBody: DataTypes.STRING,
    invoiceNumber: DataTypes.STRING,
    frn: DataTypes.BIGINT,
    sbi: DataTypes.INTEGER,
    ledger: DataTypes.STRING,
    marketingYear: DataTypes.INTEGER,
    agreementNumber: DataTypes.STRING,
    contractNumber: DataTypes.STRING,
    paymentRequestNumber: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    schedule: DataTypes.STRING,
    dueDate: DataTypes.STRING,
    originalSettlementDate: DataTypes.DATE,
    originalInvoiceNumber: DataTypes.STRING,
    invoiceCorrectionReference: DataTypes.STRING,
    value: DataTypes.DECIMAL,
    valueDecimal: {
      type: DataTypes.VIRTUAL,
      get () {
        return convertToPounds(this.value)
      }
    },
    received: DataTypes.DATE,
    receivedFormatted: {
      type: DataTypes.VIRTUAL,
      get () {
        if (this.received) {
          const formattedDate = this.received.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
          const formattedTime = this.received.toLocaleTimeString('en-GB')
          return `${formattedDate} ${formattedTime}`
        }

        return ''
      }
    },
    released: DataTypes.DATE
  },
  {
    tableName: 'paymentRequests',
    freezeTableName: true,
    timestamps: false
  })
  paymentRequest.associate = function (models) {
    paymentRequest.belongsTo(models.scheme, {
      foreignKey: 'schemeId',
      as: 'schemes'
    })
    paymentRequest.hasOne(models.debtData, {
      foreignKey: 'paymentRequestId',
      as: 'debtData'
    })
    paymentRequest.hasMany(models.invoiceLine, {
      foreignKey: 'paymentRequestId',
      as: 'invoiceLines'
    })
    paymentRequest.hasMany(models.qualityCheck, {
      foreignKey: 'paymentRequestId',
      as: 'qualityChecks'
    })
  }
  return paymentRequest
}
