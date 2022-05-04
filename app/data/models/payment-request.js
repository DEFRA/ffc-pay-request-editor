const { convertValueToStringFormat } = require('../../processing/conversion')

module.exports = (sequelize, DataTypes) => {
  const paymentRequest = sequelize.define('paymentRequest', {
    paymentRequestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    correlationId: DataTypes.STRING,
    schemeId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
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
    originalSettlementDate: DataTypes.STRING,
    originalInvoiceNumber: DataTypes.STRING,
    invoiceCorrectionReference: DataTypes.STRING,
    value: DataTypes.INTEGER,
    valueText: {
      type: DataTypes.VIRTUAL,
      get () {
        return convertValueToStringFormat(this.value)
      }
    },
    daysWaiting: {
      type: DataTypes.VIRTUAL,
      get () {
        if (this.received) {
          return (Math.round((Date.now() - this.received) / (1000 * 60 * 60 * 24)))
        }
        return ''
      }
    },
    netValue: DataTypes.INTEGER,
    netValueText: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.netValue ? convertValueToStringFormat(this.netValue) : convertValueToStringFormat(this.value)
      }
    },
    received: DataTypes.DATE,
    receivedFormatted: {
      type: DataTypes.VIRTUAL,
      get () {
        if (this.received) {
          return this.received.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
        return ''
      }
    },
    released: DataTypes.DATE,
    referenceId: DataTypes.UUID
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
    paymentRequest.belongsTo(models.category, {
      foreignKey: 'categoryId',
      as: 'category'
    })
    paymentRequest.hasOne(models.debtData, {
      foreignKey: 'paymentRequestId',
      as: 'debtData',
      allowNull: true
    })
    paymentRequest.hasMany(models.invoiceLine, {
      foreignKey: 'paymentRequestId',
      as: 'invoiceLines',
      allowNull: true
    })
    paymentRequest.hasMany(models.qualityCheck, {
      foreignKey: 'paymentRequestId',
      as: 'qualityChecks'
    })
    paymentRequest.hasMany(models.manualLedgerPaymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'manualLedgerChecks',
      allowNull: true,
      onDelete: 'CASCADE'
    })
  }
  return paymentRequest
}
