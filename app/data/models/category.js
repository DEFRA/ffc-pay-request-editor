module.exports = (sequelize, DataTypes) => {
  const schedule = sequelize.define('category', {
    categoryId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING
  },
  {
    tableName: 'category',
    freezeTableName: true,
    timestamps: false
  })
  schedule.associate = function (models) {
    schedule.belongsTo(models.paymentRequest, {
      foreignKey: 'categoryId',
      as: 'category'
    })
  }
  return schedule
}
