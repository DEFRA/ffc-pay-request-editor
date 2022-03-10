module.exports = (sequelize, DataTypes) => {
  const manualLedgerPaymentRequest = sequelize.define('manualLedgerPaymentRequest', {
    manualLedgerPaymentRequestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    ledgerPaymentRequestId: DataTypes.INTEGER,
    createdDate: DataTypes.DATE,
    createdBy: DataTypes.STRING,
    status: DataTypes.STRING
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
