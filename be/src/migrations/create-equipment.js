'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('equipment', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING },
      quantity: { type: Sequelize.INTEGER },
      import_date: { type: Sequelize.DATE },
      warranty_expiration: { type: Sequelize.DATE },
      origin: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('available', 'in_maintenance', 'broken') },
      room_id: {
        type: Sequelize.INTEGER,
        references: { model: 'gymroom', key: 'id' },
        onDelete: 'CASCADE'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('equipment');
  }
};
