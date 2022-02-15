module.exports = (sequelize, DataTypes) => {
  const qualityCheck = sequelize.define('qualityCheck', {
    qualityCheckId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    checkedDate: DataTypes.DATE,
    checkedDateFormatted: {
      type: DataTypes.VIRTUAL,
      get () {
        const formattedDate = this.checkedDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const formattedTime = this.checkedDate.toLocaleTimeString('en-GB')
        return `${formattedDate} ${formattedTime}`
      }
    },
    checkedBy: DataTypes.STRING,
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
