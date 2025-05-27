module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('feedback', {
      member_id: DataTypes.INTEGER,
      staff_id: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      feedback_date: DataTypes.DATE,
      feedback_type: DataTypes.ENUM('service', 'facility')
    }, {});
    Feedback.associate = function(models) {
      Feedback.belongsTo(models.member, { foreignKey: 'member_id' });
      Feedback.belongsTo(models.staff, { foreignKey: 'staff_id' });
    };
    return Feedback;
  };
  