// models/gymroom.js
module.exports = (sequelize, DataTypes) => {
    const Gymroom = sequelize.define('gymroom', {
      name: DataTypes.STRING,
      room_type: DataTypes.STRING,
      status: DataTypes.ENUM('active', 'inactive')
    }, {});
    Gymroom.associate = function(models) {
      Gymroom.hasMany(models.equipment, { foreignKey: 'room_id' });
    };
    return Gymroom;
  };
  