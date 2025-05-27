const { Sequelize } = require('sequelize');

// Kết nối tới MySQL
const sequelize = new Sequelize('gym_sys', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // Tắt logging để dễ quản lý
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

module.exports = { sequelize, connectDB };
