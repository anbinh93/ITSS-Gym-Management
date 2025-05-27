module.exports = (sequelize, DataTypes) => {
    const Staff = sequelize.define('staff', {
      name: DataTypes.STRING,
      role: DataTypes.ENUM('manager', 'sales', 'support'),
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      work_schedule: DataTypes.TEXT,
      performance_rating: DataTypes.DECIMAL(2, 1)
    }, {});
    Staff.associate = function(models) {
      Staff.hasMany(models.feedback, { foreignKey: 'staff_id' });
    };
    return Staff;
  };
  