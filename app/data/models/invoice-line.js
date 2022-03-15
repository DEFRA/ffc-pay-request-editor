const { convertToPounds } = require('../../processing/conversion')

module.exports = (sequelize, DataTypes) => {
  const invoiceLine = sequelize.define('invoiceLine', {
    invoiceLineId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    schemeCode: DataTypes.STRING,
    accountCode: DataTypes.STRING,
    fundCode: DataTypes.STRING,
    description: DataTypes.STRING,
    value: DataTypes.DECIMAL,
    valueDecimal: {
      type: DataTypes.VIRTUAL,
      get () {
        return convertToPounds(this.value)
      }
    }
  },
  {
    tableName: 'invoiceLines',
    freezeTableName: true,
    timestamps: false
  })
  invoiceLine.associate = function (models) {
    invoiceLine.belongsTo(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'paymentRequest'
    })
  }
  return invoiceLine
}
