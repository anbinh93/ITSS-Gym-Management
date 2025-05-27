'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trainer_member', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      trainer_id: {
        type: Sequelize.INTEGER,
        references: { model: 'trainer', key: 'id' },
        onDelete: 'CASCADE'
      },
      member_id: {
        type: Sequelize.INTEGER,
        references: { model: 'member', key: 'id' },
        onDelete: 'CASCADE'
      },
      assigned_date: Sequelize.DATE,
      note: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('trainer_member');
  }
};
