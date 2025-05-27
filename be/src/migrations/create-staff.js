'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('staff', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: Sequelize.STRING,
      role: Sequelize.ENUM('manager', 'sales', 'support'),
      phone: Sequelize.STRING,
      email: Sequelize.STRING,
      work_schedule: Sequelize.TEXT,
      performance_rating: Sequelize.DECIMAL(2, 1),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('staff');
  }
};
