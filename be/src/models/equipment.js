// models/equipment.js
module.exports = (sequelize, DataTypes) => {
    const Equipment = sequelize.define('equipment', {
      name: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      import_date: DataTypes.DATE,
      warranty_expiration: DataTypes.DATE,
      origin: DataTypes.STRING,
      status: DataTypes.ENUM('available', 'in_maintenance', 'broken'),
      room_id: DataTypes.INTEGER
    }, {});
    Equipment.associate = function(models) {
      Equipment.belongsTo(models.gymroom, { foreignKey: 'room_id' });
    };
    return Equipment;
  };
  