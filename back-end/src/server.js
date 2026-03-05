require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');
const config = require('./config/config');

connectDB();

// 使用 alter: false 避免 ALTER 时触发 MySQL 单表 64 索引上限；表结构已存在时无需 alter
sequelize.sync({ alter: false }).then(() => {
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection:', err?.message || err);
    server.close(() => process.exit(1));
  });
});
