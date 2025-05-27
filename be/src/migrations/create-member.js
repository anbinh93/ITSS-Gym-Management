'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('member', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: Sequelize.STRING,
      age: Sequelize.INTEGER,
      occupation: Sequelize.STRING,
      contact_info: Sequelize.STRING,
      birthday: Sequelize.DATE,
      membership_type: Sequelize.STRING,
      fingerprint_data: Sequelize.BLOB,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('member');
  }
};
