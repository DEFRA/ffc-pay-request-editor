module.exports = (sequelize, DataTypes) => {
  const qualityCheck = sequelize.define('qualityCheck', {
    qualityCheckId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    checkedDate: DataTypes.DATE,
    checkedBy: DataTypes.STRING,
    checkedById: DataTypes.STRING,
    status: DataTypes.STRING
  },
  {
    tableName: 'qualityChecks',
    freezeTableName: true,
    timestamps: false
  })
  qualityCheck.associate = function (models) {
    qualityCheck.belongsTo(models.paymentRequest, {
      foreignKey: 'paymentRequestId',
      as: 'paymentRequest'
    })
  }
  return qualityCheck
}
