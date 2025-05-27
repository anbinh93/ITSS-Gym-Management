module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('member', {
      name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      occupation: DataTypes.STRING,
      contact_info: DataTypes.STRING,
      birthday: DataTypes.DATE,
      membership_type: DataTypes.STRING,
      fingerprint_data: DataTypes.BLOB
    }, {
      freezeTableName: true,
    });
    Member.associate = function(models) {
      Member.hasMany(models.member_package, { foreignKey: 'member_id' });
      Member.hasMany(models.trainer_member, { foreignKey: 'member_id' });
      Member.hasMany(models.feedback, { foreignKey: 'member_id' });
    };
    return Member;
  };
  