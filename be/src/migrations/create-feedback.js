'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedback', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      member_id: {
        type: Sequelize.INTEGER,
        references: { model: 'member', key: 'id' },
        onDelete: 'SET NULL'
      },
      staff_id: {
        type: Sequelize.INTEGER,
        references: { model: 'staff', key: 'id' },
        onDelete: 'SET NULL'
      },
      content: Sequelize.TEXT,
      feedback_date: Sequelize.DATE,
      feedback_type: Sequelize.ENUM('service', 'facility'),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('feedback');
  }
};
