module.exports = (sequelize, DataTypes) => {
    const MemberPackage = sequelize.define('member_package', {
      member_id: DataTypes.INTEGER,
      package_id: DataTypes.INTEGER,
      registration_date: DataTypes.DATE,
      payment_method: DataTypes.STRING,
      status: DataTypes.ENUM('active', 'expired', 'cancelled')
    }, {});
    MemberPackage.associate = function(models) {
      MemberPackage.belongsTo(models.member, { foreignKey: 'member_id' });
      MemberPackage.belongsTo(models.membership_package, { foreignKey: 'package_id' });
    };
    return MemberPackage;
  };
  