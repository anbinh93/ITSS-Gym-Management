module.exports = (sequelize, DataTypes) => {
    const TrainerMember = sequelize.define('trainer_member', {
      trainer_id: DataTypes.INTEGER,
      member_id: DataTypes.INTEGER,
      assigned_date: DataTypes.DATE,
      note: DataTypes.TEXT
    }, {});
    TrainerMember.associate = function(models) {
      TrainerMember.belongsTo(models.trainer, { foreignKey: 'trainer_id' });
      TrainerMember.belongsTo(models.member, { foreignKey: 'member_id' });
    };
    return TrainerMember;
  };
  