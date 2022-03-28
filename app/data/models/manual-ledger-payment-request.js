module.exports = (sequelize, DataTypes) => {
  const manualLedgerPaymentRequest = sequelize.define('manualLedgerPaymentRequest', {
    manualLedgerPaymentRequestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    ledgerPaymentRequestId: DataTypes.INTEGER,
    createdDate: DataTypes.DATE,
    createdBy: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    original: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'manualLedgerPaymentRequest',
    freezeTableName: true,
    timestamps: false
  })
  manualLedgerPaymentRequest.associate = function (models) {
    manualLedgerPaymentRequest.hasOne(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      sourceKey: 'ledgerPaymentRequestId',
      as: 'ledgerPaymentRequest'
    })
  }
  return manualLedgerPaymentRequest
}
