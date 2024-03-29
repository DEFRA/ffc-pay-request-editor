const { convertValueToStringFormat } = require('../../processing/conversion')

module.exports = (sequelize, DataTypes) => {
  const invoiceLine = sequelize.define('invoiceLine', {
    invoiceLineId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    schemeCode: DataTypes.STRING,
    accountCode: DataTypes.STRING,
    fundCode: DataTypes.STRING,
    agreementNumber: DataTypes.STRING,
    description: DataTypes.STRING,
    deliveryBody: DataTypes.STRING,
    marketingYear: DataTypes.INTEGER,
    convergence: DataTypes.BOOLEAN,
    stateAid: DataTypes.BOOLEAN,
    value: DataTypes.INTEGER,
    valueText: {
      type: DataTypes.VIRTUAL,
      get () {
        return convertValueToStringFormat(this.value)
      }
    }
  },
  {
    tableName: 'invoiceLines',
    freezeTableName: true,
    timestamps: false
  })
  invoiceLine.associate = (models) => {
    invoiceLine.belongsTo(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'paymentRequest'
    })
  }
  return invoiceLine
}
