const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  headEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employeeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  budget: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active'
  },
  colorCallback: {
    type: DataTypes.STRING,
    allowNull: true
  },
  site: {
    type: DataTypes.ENUM('TT', 'TTG'),
    allowNull: false, // Assuming every department belongs to a site
    defaultValue: 'TT'
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Department',
  timestamps: false
});

module.exports = Department;
