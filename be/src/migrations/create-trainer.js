'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trainer', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: Sequelize.STRING,
      specialization: Sequelize.STRING,
      phone: Sequelize.STRING,
      email: Sequelize.STRING,
      years_of_experience: Sequelize.INTEGER,
      rating: Sequelize.DECIMAL(2, 1),
      work_schedule: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('trainer');
  }
};
