module.exports = (sequelize, DataTypes) => {
  const debtData = sequelize.define('debtData', {
    debtDataId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: DataTypes.INTEGER,
    schemeId: DataTypes.INTEGER,
    frn: DataTypes.BIGINT,
    reference: DataTypes.STRING,
    netValue: DataTypes.DECIMAL,
    debtType: DataTypes.STRING,
    recoveryDate: DataTypes.STRING,
    attachedDate: DataTypes.DATE,
    attachedDateFormatted: {
      type: DataTypes.VIRTUAL,
      get () {
        const formattedDate = this.attachedDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const formattedTime = this.attachedDate.toLocaleTimeString('en-GB')
        return `${formattedDate} ${formattedTime}`
      }
    },
    createdDate: DataTypes.DATE,
    createdDateFormatted: {
      type: DataTypes.VIRTUAL,
      get () {
        const formattedDate = this.createdDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const formattedTime = this.createdDate.toLocaleTimeString('en-GB')
        return `${formattedDate} ${formattedTime}`
      }
    },
    createdBy: DataTypes.STRING
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
