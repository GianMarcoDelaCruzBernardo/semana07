const { Sequelize, DataTypes } = require('sequelize');

// Con DB_HOST usa MySQL; sin DB_HOST usa SQLite (ideal para Render sin base externa)
const sequelize = process.env.DB_HOST
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    })
  : new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });

const User = sequelize.define('user', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Role = sequelize.define('role', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

User.belongsToMany(Role, { through: 'user_roles' });
Role.belongsToMany(User, { through: 'user_roles' });

module.exports = { sequelize, User, Role };