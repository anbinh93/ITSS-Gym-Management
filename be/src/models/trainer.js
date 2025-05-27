module.exports = (sequelize, DataTypes) => {
    const Trainer = sequelize.define('trainer', {
      name: DataTypes.STRING,
      specialization: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      years_of_experience: DataTypes.INTEGER,
      rating: DataTypes.DECIMAL(2, 1),
      work_schedule: DataTypes.TEXT
    }, {});
    Trainer.associate = function(models) {
      Trainer.hasMany(models.trainer_member, { foreignKey: 'trainer_id' });
    };
    return Trainer;
  };
  