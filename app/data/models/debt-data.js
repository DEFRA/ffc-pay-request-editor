const { convertDebtIdToText } = require('../../processing/conversion')
const toCurrencyString = require('../../utils/to-currency-string')
const { convertToPounds } = require('../../processing/conversion')

module.exports = (sequelize, DataTypes) => {
  const debtData = sequelize.define('debtData', {
    debtDataId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    schemeId: DataTypes.INTEGER,
    frn: DataTypes.BIGINT,
    reference: DataTypes.STRING,
    netValue: DataTypes.DECIMAL,
    netValueText: {
      type: DataTypes.VIRTUAL,
      get () {
        return toCurrencyString(convertToPounds(this.netValue))
      }
    },
    debtType: DataTypes.STRING,
    debtTypeText: {
      type: DataTypes.VIRTUAL,
      get () {
        return convertDebtIdToText(this.debtType)
      }
    },
    recoveryDate: DataTypes.STRING,
    attachedDate: DataTypes.DATE,
    createdDate: DataTypes.DATE,
    createdBy: DataTypes.STRING,
    createdById: DataTypes.STRING
  },
  {
    tableName: 'debtData',
    freezeTableName: true,
    timestamps: false
  })
  debtData.associate = function (models) {
    debtData.belongsTo(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'paymentRequests'
    })
    debtData.belongsTo(models.scheme, {
      foreignKey: 'schemeId',
      as: 'schemes'
    })
  }
  return debtData
}
