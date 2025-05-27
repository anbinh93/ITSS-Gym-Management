'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('member_package', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      member_id: {
        type: Sequelize.INTEGER,
        references: { model: 'member', key: 'id' },
        onDelete: 'CASCADE'
      },
      package_id: {
        type: Sequelize.INTEGER,
        references: { model: 'membership_package', key: 'id' },
        onDelete: 'CASCADE'
      },
      registration_date: Sequelize.DATE,
      payment_method: Sequelize.STRING,
      status: Sequelize.ENUM('active', 'expired', 'cancelled'),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('member_package');
  }
};
