const { convertToPounds } = require('../../currency-convert')

module.exports = (sequelize, DataTypes) => {
  const manualLedgerChecks = sequelize.define('manualLedgerChecks', {
    manualLedgerPaymentRequestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
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
    tableName: 'manualLedgerChecks',
    freezeTableName: true,
    timestamps: false
  })
  manualLedgerChecks.associate = function (models) {
    manualLedgerChecks.belongsTo(models.scheme, {
      foreignKey: 'schemeId',
      as: 'schemes'
    })
    manualLedgerChecks.hasOne(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'paymentRequest'
    })
  }
  return manualLedgerChecks
}
