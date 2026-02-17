const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PostSite = sequelize.define('PostSite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.ENUM('TT', 'TTG'),
    allowNull: false,
    unique: true // Ensure one entry per site
  },
  budget: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  numberOfDepartments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  numberOfEmployees: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'PostSite',
  timestamps: false
});

module.exports = PostSite;
