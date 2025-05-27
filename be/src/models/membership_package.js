module.exports = (sequelize, DataTypes) => {
    const MembershipPackage = sequelize.define('membership_package', {
      name: DataTypes.STRING,
      package_type: DataTypes.STRING,
      duration_days: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2)
    }, {});
    MembershipPackage.associate = function(models) {
      MembershipPackage.hasMany(models.member_package, { foreignKey: 'package_id' });
    };
    return MembershipPackage;
  };
  